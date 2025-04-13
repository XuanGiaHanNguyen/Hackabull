import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const PostCard = ({ post }) => {
  useEffect(() => {
    console.log('Image URL:', `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${post.productImage}`);
  }, [post]);
  return (
    <div className="bg-white rounded-lg border-1 shadow-md overflow-hidden border-gray-300 hover:scale-105 transition-transform">
      <div className="relative h-48">
        <img
          src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${post.productImage}`}
          alt={post.productName}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-800 text-left">{post.productName}</h3>

        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold text-[#688268]">${parseFloat(post.price).toFixed(2)}</span>
          <span className="text-sm text-gray-600">{post.place}</span>
        </div>

        <p className="text-gray-600 mb-4 overflow-hidden text-ellipsis line-clamp-2 text-left">
          {post.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
              {post.userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-600">{post.userName}</span>
          </div>

          <Link to={`/posts/${post._id}`} className="text-[#688268] hover:text-blue-700 font-medium">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;