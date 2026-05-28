import Product from "../models/Product.js";
import { getReviewSummaryByProductId } from "./reviewService.js";

// ============ Helper Functions ============

/**
 * Normalize product images
 */
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

/**
 * Normalize and validate product payload
 */
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

/**
 * Validate product data
 */
const validateProduct = (productData) => {
  if (!productData.name) {
    throw new Error("Tên sản phẩm là bắt buộc");
  }
  if (!productData.description) {
    throw new Error("Mô tả sản phẩm là bắt buộc");
  }
  if (!productData.category_id) {
    throw new Error("Danh mục là bắt buộc");
  }
  if (!Number.isFinite(productData.price) || productData.price <= 0) {
    throw new Error("Giá phải lớn hơn 0");
  }
  if (!Number.isFinite(productData.stock) || productData.stock < 0) {
    throw new Error("Tồn kho không được âm");
  }
  if (!productData.images.length) {
    throw new Error("Ít nhất 1 ảnh là bắt buộc");
  }
};

// ============ Service Functions ============

/**
 * Get all products with optional category filter
 */
export const getAllProducts = async (params) => {
  let query = {};

  if (params.category) {
    query.category_id = params.category;
  }

  const products = await Product.find(query).populate("category_id");
  return products;
};

/**
 * Get product by slug
 */
export const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug })
    .populate("category_id")
    .populate({
      path: "reviews",
      populate: {
        path: "user",
        select: "fullName avatar role",
      },
      options: {
        sort: { createdAt: -1 },
      },
    });

  if (!product) {
    throw new Error("Sản phẩm không tồn tại");
  }

  const reviewSummary = await getReviewSummaryByProductId(product._id);
  const productData = product.toObject();

  return {
    ...productData,
    reviewSummary,
  };
};

/**
 * Create new product
 */
export const createProduct = async (productData) => {
  const normalized = normalizeProductPayload(productData);
  validateProduct(normalized);

  const product = new Product(normalized);
  const newProduct = await product.save();
  return newProduct;
};

/**
 * Update product by ID
 */
export const updateProduct = async (productId, updateData) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const updates = normalizeProductPayload(updateData, product);
  validateProduct(updates);

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    { $set: updates },
    { new: true, runValidators: true, context: "query" }
  );

  if (!updatedProduct) {
    throw new Error("Product not found");
  }

  return updatedProduct;
};

/**
 * Delete product by ID
 */
export const deleteProduct = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  await Product.deleteOne({ _id: productId });
  return { message: "Product deleted" };
};

/**
 * Get top 20 products by sales
 */
export const getProductsSale = async () => {
  const products = await Product.aggregate([
    {
      $sort: { sold: -1 },
    },
    {
      $limit: 20,
    },
  ]);

  return products;
};

/**
 * Search products by name
 */
export const searchProducts = async (params) => {
  const searchQuery = params.query || params.q;

  if (!searchQuery) {
    throw new Error("Query parameter is required");
  }

  const products = await Product.find({
    name: { $regex: searchQuery, $options: "i" },
  }).populate("category_id");

  return products;
};

/**
 * Filter products by price ranges
 */
export const filterProductsByPrice = async (params) => {
  const { priceRanges } = params;

  if (!priceRanges || !Array.isArray(priceRanges)) {
    throw new Error("Giá trị lọc không hợp lệ");
  }

  const priceQueries = priceRanges.map((range) => {
    const query = {};
    if (typeof range.min === "number") {
      query.$gte = range.min;
    }
    if (typeof range.max === "number") {
      query.$lte = range.max;
    }
    return { price: query };
  });

  const finalQuery = {
    $or: priceQueries,
  };

  const products = await Product.find(finalQuery);
  return products;
};
