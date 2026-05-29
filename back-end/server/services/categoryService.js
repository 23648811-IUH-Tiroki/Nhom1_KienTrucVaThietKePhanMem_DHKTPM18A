import Category from "../models/Category.js";
import slugify from "slugify";
import Product from "../models/Product.js";
import mongoose from "mongoose";
import { createServiceError } from "../utils/serviceError.js";

// ============ Helper Functions ============

/**
 * Create slug from value
 */
const createSlug = (value) => {
  return slugify(String(value || ""), { lower: true, strict: true });
};

/**
 * Normalize category payload
 */
const normalizeCategoryPayload = (payload = {}, existingCategory = null) => {
  const name = String(payload.name ?? existingCategory?.name ?? "").trim();
  const type = String(payload.type ?? existingCategory?.type ?? "").trim();
  const image = String(payload.image ?? existingCategory?.image ?? "").trim();
  const descriptionValue = String(
    payload.description ?? existingCategory?.description ?? ""
  ).trim();

  const slugSource = payload.slug ?? existingCategory?.slug ?? name;
  const slug = createSlug(slugSource) || `category-${Date.now()}`;
  const slugTypeSource = payload.slug_type ?? existingCategory?.slug_type ?? type;
  const slug_type = createSlug(slugTypeSource) || createSlug(type);

  return {
    name,
    description: descriptionValue || (name ? `Danh mục ${name}` : ""),
    image,
    slug,
    type,
    slug_type,
  };
};

const buildProductRatingLookupPipeline = () => [
  {
    $lookup: {
      from: "reviews",
      let: { productId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$product", "$$productId"] },
                { $eq: ["$isHidden", false] },
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ],
      as: "reviewSummaryAgg",
    },
  },
  {
    $addFields: {
      rating: {
        $round: [
          { $ifNull: [{ $arrayElemAt: ["$reviewSummaryAgg.averageRating", 0] }, 0] },
          1,
        ],
      },
      numReviews: {
        $ifNull: [{ $arrayElemAt: ["$reviewSummaryAgg.totalReviews", 0] }, 0],
      },
    },
  },
  { $unset: "reviewSummaryAgg" },
];

const buildCategoryLookupPipeline = () => [
  {
    $lookup: {
      from: "categories",
      localField: "category_id",
      foreignField: "_id",
      as: "category_id",
    },
  },
  {
    $unwind: {
      path: "$category_id",
      preserveNullAndEmptyArrays: true,
    },
  },
];

/**
 * Ensure category uniqueness
 */
const ensureUniqueCategory = async (payload, excludeId = null) => {
  const idFilter = excludeId ? { $ne: excludeId } : { $exists: true };

  if (payload.slug) {
    const existingSlug = await Category.findOne({
      slug: payload.slug,
      _id: idFilter,
    });
    if (existingSlug) {
      throw createServiceError("Slug đã tồn tại. Vui lòng chọn slug khác.", 400);
    }
  }

  if (payload.name && payload.type) {
    const existingName = await Category.findOne({
      name: payload.name,
      type: payload.type,
      _id: idFilter,
    });
    if (existingName) {
      throw createServiceError("Tên danh mục đã tồn tại trong cùng loại.", 400);
    }
  }
};

/**
 * Validate category payload
 */
const validateCategory = (payload) => {
  if (!payload.name) {
    throw createServiceError("Tên danh mục là bắt buộc", 400);
  }
  if (!payload.type) {
    throw createServiceError("Loại danh mục là bắt buộc", 400);
  }
  if (!payload.slug) {
    throw createServiceError("Slug là bắt buộc", 400);
  }
  if (!payload.slug_type) {
    throw createServiceError("Slug type là bắt buộc", 400);
  }
};

// ============ Service Functions ============

/**
 * Get all categories with optional pagination and filters
 */
export const getAllCategories = async (params) => {
  const pageRaw = Number.parseInt(params.page, 10);
  const limitRaw = Number.parseInt(params.limit, 10);
  const search = String(params.search || params.query || "").trim();
  const type = String(params.type || "").trim();

  const shouldPaginate = Number.isFinite(pageRaw) || Number.isFinite(limitRaw);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 10;

  const filter = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }
  if (type) {
    filter.type = type;
  }

  if (!shouldPaginate) {
    const categories = await Category.find(filter).sort({ name: 1 });
    return categories;
  }

  const skip = (page - 1) * limit;
  const [categories, total] = await Promise.all([
    Category.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
    Category.countDocuments(filter),
  ]);

  return {
    data: categories,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get category by ID
 */
export const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw createServiceError("Category not found", 404);
  }
  return category;
};

/**
 * Create new category
 */
export const createCategory = async (categoryData) => {
  const payload = normalizeCategoryPayload(categoryData);
  validateCategory(payload);
  await ensureUniqueCategory(payload);

  const category = new Category(payload);
  const newCategory = await category.save();
  return newCategory;
};

/**
 * Update category by ID
 */
export const updateCategory = async (categoryId, updateData) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw createServiceError("Category not found", 404);
  }

  const payload = normalizeCategoryPayload(updateData, category);
  validateCategory(payload);
  await ensureUniqueCategory(payload, categoryId);

  const updatedCategory = await Category.findByIdAndUpdate(
    categoryId,
    { $set: payload },
    { new: true, runValidators: true }
  );

  if (!updatedCategory) {
    throw new Error("Category not found");
  }

  return updatedCategory;
};

/**
 * Delete category by ID
 */
export const deleteCategory = async (categoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw createServiceError("Category not found", 404);
  }

  // Check if any products use this category
  const productCount = await Product.countDocuments({ category_id: categoryId });
  if (productCount > 0) {
    throw createServiceError(
      `Không thể xóa danh mục vì có ${productCount} sản phẩm đang sử dụng.`,
      400
    );
  }

  await Category.deleteOne({ _id: categoryId });
  return { message: "Category deleted" };
};

/**
 * Delete multiple categories
 */
export const deleteCategories = async (categoryIds) => {
  const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds];

  const productsCount = await Product.countDocuments({
    category_id: { $in: ids },
  });

  if (productsCount > 0) {
    throw new Error(
      `Không thể xóa danh mục vì có ${productsCount} sản phẩm đang sử dụng.`
    );
  }

  const result = await Category.deleteMany({ _id: { $in: ids } });
  return {
    message: `${result.deletedCount} danh mục đã được xóa`,
    deletedCount: result.deletedCount,
  };
};

export const getProductByCatetoryType = async (slugType) => {
  const categorys = await Category.find({ slug_type: slugType });

  if (categorys.length === 0) {
    throw createServiceError("Danh mục không tồn tại", 404);
  }

  const categoryIds = categorys.map((category) => category._id);
  return Product.aggregate([
    { $match: { category_id: { $in: categoryIds } } },
    ...buildCategoryLookupPipeline(),
    ...buildProductRatingLookupPipeline(),
  ]);
};

export const searchCategories = async (searchTerm) => {
  const search = String(searchTerm || "").trim();

  if (!search) {
    throw createServiceError("Query parameter is required", 400);
  }

  return Category.find({
    name: { $regex: search, $options: "i" },
  }).sort({ name: 1 });
};

export const getCategoryByType = async (slugType) => {
  const categorys = await Category.find({ slug_type: slugType });

  if (categorys.length === 0) {
    throw createServiceError("Danh mục không tồn tại", 404);
  }

  return categorys;
};

export const getProductByCatetoryName = async (slug, page = 1, limit = 8) => {
  if (page < 1 || limit < 1) {
    throw createServiceError("Page và limit phải là số nguyên dương", 400);
  }

  if (!slug) {
    throw createServiceError("Thiếu tham số slug", 400);
  }

  const categorys = await Category.find({ slug: { $regex: slug, $options: "i" } });

  if (categorys.length === 0) {
    throw createServiceError("Danh mục không tồn tại", 404);
  }

  const skip = (page - 1) * limit;
  const categoryIds = categorys.map((category) => category._id);
  const result = await Product.aggregate([
    { $match: { category_id: { $in: categoryIds } } },
    ...buildCategoryLookupPipeline(),
    ...buildProductRatingLookupPipeline(),
    {
      $facet: {
        products: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: "count" }],
      },
    },
    {
      $addFields: {
        totalCount: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
      },
    },
  ]);

  const products = result?.[0]?.products || [];
  const totalCount = Number(result?.[0]?.totalCount || 0);

  return {
    products,
    totalPages: Math.ceil(totalCount / limit),
  };
};
