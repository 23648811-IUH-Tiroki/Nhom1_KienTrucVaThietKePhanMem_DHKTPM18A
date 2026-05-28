import Category from '../models/Category.js';
import slugify from 'slugify';
import Product from '../models/Product.js';

const createSlug = (value) => {
  return slugify(String(value || ''), { lower: true, strict: true });
};

const normalizeCategoryPayload = (payload = {}, existingCategory = null) => {
  const name = String(payload.name ?? existingCategory?.name ?? '').trim();
  const type = String(payload.type ?? existingCategory?.type ?? '').trim();
  const image = String(payload.image ?? existingCategory?.image ?? '').trim();
  const descriptionValue = String(
    payload.description ?? existingCategory?.description ?? ''
  ).trim();

  const slugSource = payload.slug ?? existingCategory?.slug ?? name;
  const slug = createSlug(slugSource) || `category-${Date.now()}`;
  const slugTypeSource = payload.slug_type ?? existingCategory?.slug_type ?? type;
  const slug_type = createSlug(slugTypeSource) || createSlug(type);

  return {
    name,
    description: descriptionValue || (name ? `Danh mục ${name}` : ''),
    image,
    slug,
    type,
    slug_type,
  };
};

const ensureUniqueCategory = async (payload, excludeId = null) => {
  const idFilter = excludeId ? { $ne: excludeId } : { $exists: true };

  if (payload.slug) {
    const existingSlug = await Category.findOne({
      slug: payload.slug,
      _id: idFilter,
    });
    if (existingSlug) {
      return 'Slug đã tồn tại. Vui lòng chọn slug khác.';
    }
  }

  if (payload.name && payload.type) {
    const existingName = await Category.findOne({
      name: payload.name,
      type: payload.type,
      _id: idFilter,
    });
    if (existingName) {
      return 'Tên danh mục đã tồn tại trong cùng loại.';
    }
  }

  return null;
};

export const getAllCategories = async (req, res) => {
  try {
    const pageRaw = Number.parseInt(req.query.page, 10);
    const limitRaw = Number.parseInt(req.query.limit, 10);
    const search = String(req.query.search || req.query.query || '').trim();
    const type = String(req.query.type || '').trim();

    const shouldPaginate = Number.isFinite(pageRaw) || Number.isFinite(limitRaw);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 10;

    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (type) {
      filter.type = type;
    }

    if (!shouldPaginate) {
      const categories = await Category.find(filter).sort({ name: 1 });
      return res.json(categories);
    }

    const skip = (page - 1) * limit;
    const [categories, total] = await Promise.all([
      Category.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
      Category.countDocuments(filter),
    ]);

    res.json({
      data: categories,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const payload = normalizeCategoryPayload(req.body);

    if (!payload.name) {
      return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
    }
    if (!payload.type) {
      return res.status(400).json({ message: 'Loại danh mục là bắt buộc' });
    }
    if (!payload.slug) {
      return res.status(400).json({ message: 'Slug là bắt buộc' });
    }
    if (!payload.slug_type) {
      return res.status(400).json({ message: 'Slug type là bắt buộc' });
    }

    const uniqueError = await ensureUniqueCategory(payload);
    if (uniqueError) {
      return res.status(400).json({ message: uniqueError });
    }

    const category = new Category(payload);
    const newCategory = await category.save();
    return res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const payload = normalizeCategoryPayload(req.body, category);

    if (!payload.name) {
      return res.status(400).json({ message: 'Tên danh mục là bắt buộc' });
    }
    if (!payload.type) {
      return res.status(400).json({ message: 'Loại danh mục là bắt buộc' });
    }
    if (!payload.slug) {
      return res.status(400).json({ message: 'Slug là bắt buộc' });
    }
    if (!payload.slug_type) {
      return res.status(400).json({ message: 'Slug type là bắt buộc' });
    }

    const uniqueError = await ensureUniqueCategory(payload, category._id);
    if (uniqueError) {
      return res.status(400).json({ message: uniqueError });
    }

    Object.assign(category, payload);
    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.deleteOne({ _id: req.params.id });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getProductByCatetoryType = async (req, res) => {
  try {
    const { slug_type } = req.params;
    const categorys = await Category.find({ slug_type: slug_type });
    if (categorys.length === 0) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }
    const categoryIds = categorys.map(category => category._id);
    const products = await Product.find({ category_id: { $in: categoryIds } });
    res.status(200).json(products)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const searchCategories = async (req, res) => {
  try {
    const search = String(req.query.search || req.query.query || '').trim();
    if (!search) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const categories = await Category.find({
      name: { $regex: search, $options: 'i' },
    }).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getCategoryByType = async (req, res) => {
  try {
    const { slug_type } = req.params;
    const categorys = await Category.find({ slug_type: slug_type });
    if (categorys.length === 0) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }
    res.status(200).json(categorys);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const getProductByCatetoryName = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;
  const skip = (page - 1) * limit;

  console.log(req.query);



  if (page < 1 || limit < 1) {
    return res.status(400).json({ message: "Page và limit phải là số nguyên dương" });
  }

  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ message: "Thiếu tham số slug" });
    }

    const categorys = await Category.find({ slug: { $regex: slug, $options: 'i' } });
    if (categorys.length === 0) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }

    const categoryIds = categorys.map(category => category._id);
    const [products, totalProducts] = await Promise.all([
      Product.find({ category_id: { $in: categoryIds } })
        .populate('category_id')
        .skip(skip)
        .limit(limit),
      Product.countDocuments({ category_id: { $in: categoryIds } })
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      products,
      totalPages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách sản phẩm" });
  }
}