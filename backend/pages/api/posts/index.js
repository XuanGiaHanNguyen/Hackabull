import { connectToDB } from "../../../lib/db";
import Post from '../../../models/Post';
import { createRouter } from 'next-connect';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

// Configure CORS middleware
const corsMiddleware = cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', '*'],  // Added wildcard for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

// Create router
const router = createRouter({
  onError: (err, req, res) => {
    console.error('API Error:', err);
    res.status(500).json({ success: false, error: err.message });
  },
  onNoMatch: (req, res) => {
    res.status(404).json({ success: false, error: 'Method not allowed' });
  },
});

// Add CORS middleware
router.use(corsMiddleware);

// GET handler - get all posts
router.get(async (req, res) => {
  try {
    console.log("Connecting to database...");
    await connectToDB();
    console.log("Database connection successful");

    const posts = await Post.find({}).sort({ createdAt: -1 });
    console.log(`Found ${posts.length} posts`);

    return res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST handler - create a new post
router.use(upload.single('productImage')).post(async (req, res) => {
  try {
    console.log("Connecting to database for post creation...");
    await connectToDB();
    console.log("Database connection successful");
    console.log("Request body:", req.body);

    const { userId, userName, userEmail, productName, price, place, description } = req.body;

    // Validate required fields
    if (!productName || !price) {
      return res.status(400).json({
        success: false,
        error: "Product name and price are required"
      });
    }

    // Create post with uploaded file path
    const postData = {
      userId: userId || 'anonymous',
      userName: userName || 'Anonymous User',
      userEmail: userEmail || 'anonymous@example.com',
      productName,
      price: parseFloat(price),
      place: place || 'Unknown',
      description: description || '',
      // Change this line in your POST handler:
      productImage: req.file ? `/uploads/${req.file.filename}` : '',
    };

    console.log("Creating post with data:", postData);
    const post = await Post.create(postData);
    console.log("Post created:", post._id);

    return res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Export config to disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Export handler
export default async function handler(req, res) {
  // Add CORS headers manually for preflight requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log(`Handling ${req.method} request to /api/posts`);
    return await router.run(req, res);
  } catch (error) {
    console.error("Unhandled error in API handler:", error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}