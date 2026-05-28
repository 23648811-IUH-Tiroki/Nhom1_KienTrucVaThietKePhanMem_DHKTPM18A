import * as categoryService from "../services/categoryService.js";
import { sendControllerError } from "../utils/controllerError.js";

export const getAllCategories = async (req, res) => {
  try {
    const result = await categoryService.getAllCategories(req.query);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const result = await categoryService.getCategoryById(req.params.id);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 404);
  }
};

export const createCategory = async (req, res) => {
  try {
    const result = await categoryService.createCategory(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return sendControllerError(res, error, 400);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const result = await categoryService.updateCategory(req.params.id, req.body);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 400);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const getProductByCatetoryType = async (req, res) => {
  try {
    const result = await categoryService.getProductByCatetoryType(req.params.slug_type);
    return res.status(200).json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const searchCategories = async (req, res) => {
  try {
    const result = await categoryService.searchCategories(req.query.search || req.query.query);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const getCategoryByType = async (req, res) => {
  try {
    const result = await categoryService.getCategoryByType(req.params.slug_type);
    return res.status(200).json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const getProductByCatetoryName = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 8;
    const result = await categoryService.getProductByCatetoryName(req.params.slug, page, limit);
    return res.status(200).json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};