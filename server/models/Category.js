import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  slug: {
    type: String,
    unique: true,
  },
  type: {
    type: String,
    required: true,
  },
  slug_type: {
    type: String,
    required: true,
  },
}, { collection: 'categories' });

const Category = mongoose.model('Category', categorySchema);

export default Category;