import { Schema } from 'mongoose';
import ReviewSchema from './ReviewMongoose.js';

// Define the Product schema
const ProductSchema = new Schema({
  name: {
    type: String,
    required: 'Please provide a name for the product'
  },
  description: {
    type: String,
    required: 'Please describe the product'
  },
  price: {
    type: Number,
    required: 'Please specify the price of the product'
  },
  image: {
    type: String,
    required: 'Please upload an image of the product'
  },
  order: {
    type: Number,
    required: 'Please enter the order number'
  },
  availability: {
    type: Boolean,
    required: 'Is the product available? Please indicate'
  },
  _productCategoryId: {
    type: Schema.Types.ObjectId,
    required: 'Please choose a Product Category',
    ref: 'ProductCategory'
  },
  avgStars: {
    type: Number,
    default: 0
  },
  numberOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [ReviewSchema]
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

// Define a virtual field 'productCategory'
ProductSchema.virtual('productCategory', {
  ref: 'ProductCategory',
  localField: '_productCategoryId',
  foreignField: '_id'
});

export default ProductSchema;
