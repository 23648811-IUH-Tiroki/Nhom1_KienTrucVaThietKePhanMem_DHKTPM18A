import * as reviewService from "../services/reviewService.js";
import { sendControllerError } from "../utils/controllerError.js";

export const getReviewSummaryByProductId = async (productId) => {
  return reviewService.getReviewSummaryByProductId(productId);
};

export const canReviewProduct = async (req, res) => {
  try {
    const result = await reviewService.canReviewProduct(req.user, req.params.productId);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const checkOrderReview = async (req, res) => {
  try {
    const result = await reviewService.checkOrderReview(req.user, req.body);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const getMyPurchasedProducts = async (req, res) => {
  try {
    const result = await reviewService.getMyPurchasedProducts(req.user);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const result = await reviewService.getMyReviews(req.user);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const createReview = async (req, res) => {
  try {
    const result = await reviewService.createReview(req.user, req.body);
    return res.status(201).json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const getReviewsByProduct = async (req, res) => {
  try {
    const result = await reviewService.getReviewsByProduct(req.params.productId);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const deleteReview = async (req, res) => {
  try {
    const result = await reviewService.deleteReview(req.user, req.params.id);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const hideReview = async (req, res) => {
  try {
    const result = await reviewService.hideReview(req.params.id);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const updateReview = async (req, res) => {
  try {
    const result = await reviewService.updateReview(req.user, req.params.id, req.body);
    return res.json(result);
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};