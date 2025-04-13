import { connectToDB } from "../../../lib/db";  // Use the same import name as in your index file
import Post from '../../../models/Post';
import { createRouter } from 'next-connect';
import cors from 'cors';

// Configure CORS middleware - keep consistent with your index file
const corsMiddleware = cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
});

// Create router with the newer API to match your index file
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
    // Get a single post
    try {
      await connectToDB();  // Use the same function name as in your index file
      
      const { id } = req.query;
      const post = await Post.findById(id);
      
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
      
      res.status(200).json({ success: true, data: post });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  })
  .put(async (req, res) => {
    // Update a post
    try {
      await connectToDB();
      
      const { id } = req.query;
      const post = await Post.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
      
      res.status(200).json({ success: true, data: post });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  })
  .delete(async (req, res) => {
    // Delete a post
    try {
      await connectToDB();
      
      const { id } = req.query;
      const deletedPost = await Post.findByIdAndDelete(id);
      
      if (!deletedPost) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
      
      res.status(200).json({ success: true, data: {} });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  });

// Export the handler function
export default async function handler(req, res) {
  // Add CORS headers manually as fallback - keep consistent with your index file
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