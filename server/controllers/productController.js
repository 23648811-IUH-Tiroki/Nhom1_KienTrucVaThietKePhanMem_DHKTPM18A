import Product from '../models/Product.js';

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
    const product = await Product.findOne({slug: slug}).populate('category_id');
    if (!product) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req, res) => {
  const product = new Product(req.body);
  try {
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

    Object.assign(product, req.body);
    const updatedProduct = await product.save();
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
