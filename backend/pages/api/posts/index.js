import { connectToDB } from "../../../lib/db"  // Use named import
import Post from '../../../models/Post';

import { createRouter } from 'next-connect';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

// Configure CORS middleware
const corsMiddleware = cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
});

// Set up multer for file storage
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = './public/uploads/';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
});

// Create router with the newer API
const router = createRouter({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  },
  onNoMatch: (req, res) => {
    res.status(404).json({ error: 'Method not allowed' });
  },
});

// Add CORS middleware to all routes
router.use(corsMiddleware);

// Add handlers for different methods
router
  .get(async (req, res) => {
    // Get all posts
    try {
      await connectToDB();  // Use the correct function name
      const posts = await Post.find({}).sort({ createdAt: -1 });
      res.status(200).json({ success: true, data: posts });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  })
  .use(upload.single('productImage'))
  .post(async (req, res) => {
    // Create a new post
    try {
      await connectToDB();  // Use the correct function name
      
      const { userId, userName, userEmail, productName, price, place, description } = req.body;
      
      // Create post with uploaded file path
      const postData = {
        userId,
        userName,
        userEmail,
        productName,
        price: parseFloat(price),
        place,
        description,
        productImage: req.file ? `/uploads/${req.file.filename}` : '',
      };
      
      const post = await Post.create(postData);
      res.status(201).json({ success: true, data: post });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

// Disable body parser for this route to support file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Export the handler function
export default async function handler(req, res) {
  // Add CORS headers manually as fallback
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return router.run(req, res);
}