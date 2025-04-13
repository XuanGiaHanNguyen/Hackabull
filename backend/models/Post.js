// models/Post.js
import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  // User information (from database)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  
  // Product information (from frontend input)
  productName: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  place: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  productImage: {
    type: String, // URL to image or path
    required: true
  },
  
  // Additional useful fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'withdrawn'],
    default: 'active'
  }
});

// Update the timestamp when a post is modified
PostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if the model is already defined to prevent errors in development mode with hot reloading
export default mongoose.models.Post || mongoose.model('Post', PostSchema, 'post');