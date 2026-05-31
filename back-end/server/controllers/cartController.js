import * as cartService from "../services/cartService.js";
import { sendControllerError } from "../utils/controllerError.js";

export const addToCart = async (req, res) => {
  try {
    const result = await cartService.addToCart(req.user?._id, req.body);
    return res.status(201).json(result);
  } catch (error) {
    return sendControllerError(res, error, 400);
  }
};

export const getCartByUserId = async (req, res) => {
  try {
    const result = await cartService.getCartByUserId(req.user?._id);

    if (result.status === "empty") {
      return res.status(200).json(result);
    }

    return res.status(200).json({ status: "success", data: result.data });
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const updateCart = async (req, res) => {
  try {
    const result = await cartService.updateCart(req.user?._id, req.body);
    return res.status(200).json(result);
  } catch (error) {
    return sendControllerError(res, error, 400);
  }
};

export const updateCartItemQuantity = async (req, res) => {
  try {
    const result = await cartService.updateCartItemQuantity(
      req.user?._id,
      req.params.itemId,
      req.body.quantity
    );

    return res.status(200).json({ status: "success", data: result });
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const deleteCart = async (req, res) => {
  try {
    const result = await cartService.deleteCart(req.user?._id);
    return res.status(200).json(result);
  } catch (error) {
    return sendControllerError(res, error, 400);
  }
};

export const deleteProductFromCart = async (req, res) => {
  try {
    const result = await cartService.deleteProductFromCart(req.user?._id, req.params.product_id);

    return res.status(200).json({
      status: "success",
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return sendControllerError(res, error, 500);
  }
};

export const deleteAllProductsFromCart = async (req, res) => {
  try {
    const result = await cartService.deleteAllProductsFromCart(req.user?._id);
    return res.status(200).json(result);
  } catch (error) {
    return sendControllerError(res, error, 400);
  }
};

export const countCartItems = async (req, res) => {
  try {
    const result = await cartService.countCartItems(req.user?._id);
    return res.status(200).json(result);
  } catch (error) {
    return sendControllerError(res, error, 400);
  }
};