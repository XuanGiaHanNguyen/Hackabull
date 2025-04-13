// pages/api/posts/[id].js
import dbConnect from '../../../lib/dbConnect';
import Post from '../../../models/Post';
import nc from 'next-connect';

const handler = nc({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  },
  onNoMatch: (req, res) => {
    res.status(404).json({ error: 'Method not allowed' });
  },
})
  .get(async (req, res) => {
    // Get a single post
    try {
      await dbConnect();
      
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
      await dbConnect();
      
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
      await dbConnect();
      
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

export default handler;