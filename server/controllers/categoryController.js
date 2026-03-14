import Category from '../models/Category.js';
import slugify from 'slugify'; // Thêm thư viện slugify
import Product from '../models/Product.js';

// Tạo slug từ tên danh mục
const createSlug = (name) => {
  return slugify(name, { lower: true, strict: true });
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
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
  const { name, description, image } = req.body;
  const slug = createSlug(name); // Tạo slug từ tên danh mục

  const category = new Category({
    name,
    description,
    image,
    slug, // Thêm slug vào dữ liệu
  });

  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
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

    // Cập nhật slug nếu tên thay đổi
    if (req.body.name) {
      req.body.slug = createSlug(req.body.name);
    }

    Object.assign(category, req.body);
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

    await category.remove();
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getProductByCatetoryType = async (req, res) => {
  try{
    const { slug_type } = req.params;
    const categorys = await Category.find({ slug_type: slug_type });
    if (categorys===0) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }
    const categoryIds = categorys.map(category => category._id);
    const products = await Product.find({ category_id: { $in: categoryIds } });
    res.status(200).json(products)
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
}

export const searchCategories = async (req, res) => {
  const { query } = req.query;
  try {
    const categories = await Category.find({
      name: { $regex: query, $options: 'i' }, // Tìm kiếm theo tên danh mục (không phân biệt hoa thường)
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getCategoryByType = async (req, res) => {
  try{
    const { slug_type } = req.params;    
    const categorys = await Category.find({ slug_type: slug_type });
    if (categorys===0) {
      return res.status(404).json({ message: "Danh mục không tồn tại" });
    }
    res.status(200).json(categorys);
  } catch(err) {
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