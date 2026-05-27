import Product from '../models/Product.js';
import { getReviewSummaryByProductId } from './reviewController.js';

const normalizeImages = (images) => {
  if (Array.isArray(images)) {
    return images.map((image) => String(image || "").trim()).filter(Boolean);
  }

  if (typeof images === "string") {
    const trimmed = images.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((image) => String(image || "").trim()).filter(Boolean);
      }
    } catch {
      // fall back to single string image
    }

    return [trimmed];
  }

  return [];
};

const normalizeProductPayload = (payload = {}, existingProduct = null) => {
  const categoryId = payload.category_id?._id || payload.category_id || "";
  const images = normalizeImages(payload.images);
  const slugSource = String(payload.slug || payload.name || existingProduct?.name || "").trim();

  const normalized = {
    name: String(payload.name || existingProduct?.name || "").trim(),
    description: String(payload.description || existingProduct?.description || "").trim(),
    price: Number(payload.price ?? existingProduct?.price ?? 0),
    stock: Number(payload.stock ?? existingProduct?.stock ?? 0),
    category_id: String(categoryId).trim(),
    slug: slugSource
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-"),
  };

  if (images.length > 0) {
    normalized.images = images;
  } else if (existingProduct?.images?.length) {
    normalized.images = existingProduct.images;
  } else {
    normalized.images = [];
  }

  if (!normalized.slug) {
    normalized.slug = `product-${Date.now()}`;
  }

  return normalized;
};

export const getAllProducts = async (req, res) => {
  try {
    let query = {};
    
    if (req.query.category) {
      query.category_id = req.query.category;
    }

    const products = await Product.find(query).populate('category_id');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductByName = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({slug: slug})
      .populate('category_id')
      .populate({
        path: 'reviews',
        populate: {
          path: 'user',
          select: 'fullName avatar role',
        },
        options: {
          sort: { createdAt: -1 },
        },
      });
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }

    const reviewSummary = await getReviewSummaryByProductId(product._id);
    const productData = product.toObject();

    res.json({
      ...productData,
      reviewSummary,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const productData = normalizeProductPayload(req.body);

    if (!productData.name) {
      return res.status(400).json({ message: "Tên sản phẩm là bắt buộc" });
    }
    if (!productData.description) {
      return res.status(400).json({ message: "Mô tả sản phẩm là bắt buộc" });
    }
    if (!productData.category_id) {
      return res.status(400).json({ message: "Danh mục là bắt buộc" });
    }
    if (!Number.isFinite(productData.price) || productData.price <= 0) {
      return res.status(400).json({ message: "Giá phải lớn hơn 0" });
    }
    if (!Number.isFinite(productData.stock) || productData.stock < 0) {
      return res.status(400).json({ message: "Tồn kho không được âm" });
    }
    if (!productData.images.length) {
      return res.status(400).json({ message: "Ít nhất 1 ảnh là bắt buộc" });
    }

    const product = new Product(productData);
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updates = normalizeProductPayload(req.body, product);

    if (!updates.name) {
      return res.status(400).json({ message: "Tên sản phẩm là bắt buộc" });
    }
    if (!updates.description) {
      return res.status(400).json({ message: "Mô tả sản phẩm là bắt buộc" });
    }
    if (!updates.category_id) {
      return res.status(400).json({ message: "Danh mục là bắt buộc" });
    }
    if (!Number.isFinite(updates.price) || updates.price <= 0) {
      return res.status(400).json({ message: "Giá phải lớn hơn 0" });
    }
    if (!Number.isFinite(updates.stock) || updates.stock < 0) {
      return res.status(400).json({ message: "Tồn kho không được âm" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true, context: "query" }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Updated from product.remove() to deleteOne()
    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductsSale = async (req, res) => {
  try{
    const products = await Product.aggregate([
      {
        $sort: { sold: 1 }
      },
      {
        $limit: 20
      }
    ]);

    res.status(200).json(products);
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
}
// Search products
export const searchProducts = async (req, res) => {
  // Sửa để xử lý cả 'query' và 'q' để tương thích với frontend
  const searchQuery = req.query.query || req.query.q;

  if (!searchQuery) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    const products = await Product.find({
      name: { $regex: searchQuery, $options: 'i' }, 
    }).populate('category_id'); 

    res.json(products); 
  } catch (err) {
    console.error("Error in searchProducts:", err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const filterProductsByPrice = async (req, res) => {
  try {
    const { priceRanges } = req.body;

    if (!priceRanges || !Array.isArray(priceRanges)) {
      return res.status(400).json({ error: 'Giá trị lọc không hợp lệ' });
    }

    const priceQueries = priceRanges.map(range => {
      const query = {};
      if (typeof range.min === 'number') {
        query.$gte = range.min;
      }
      if (typeof range.max === 'number') {
        query.$lte = range.max;
      }
      return { price: query };
    });

    const finalQuery = {
      $or: priceQueries,
    };

    const products = await Product.find(finalQuery);

    res.status(200).json(products)
  } catch (error) {
    console.error('Lỗi khi lọc sản phẩm:', error);
    res.status(500).json({ error: 'Lỗi server khi lọc sản phẩm' });
  }
};
