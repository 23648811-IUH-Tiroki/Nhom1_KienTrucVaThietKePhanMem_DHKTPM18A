import * as productService from "../services/productService.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);
    return res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const getProductByName = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);
    return res.json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    return res.status(404).json({ message: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const newProduct = await productService.createProduct(req.body);
    return res.status(201).json(newProduct);
  } catch (err) {
    console.error("Error creating product:", err);
    return res.status(400).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await productService.updateProduct(req.params.id, req.body);
    return res.json(updatedProduct);
  } catch (err) {
    console.error("Error updating product:", err);
    return res.status(400).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    return res.json(result);
  } catch (err) {
    console.error("Error deleting product:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const getProductsSale = async (req, res) => {
  try {
    const products = await productService.getProductsSale();
    return res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching sale products:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const searchProducts = async (req, res) => {
  try {
    const products = await productService.searchProducts(req.query);
    return res.json(products);
  } catch (err) {
    console.error("Error searching products:", err);
    return res.status(400).json({ message: err.message });
  }
};

export const filterProductsByPrice = async (req, res) => {
  try {
    const products = await productService.filterProductsByPrice(req.body);
    return res.status(200).json(products);
  } catch (err) {
    console.error("Error filtering products:", err);
    return res.status(500).json({ error: err.message });
  }
};
