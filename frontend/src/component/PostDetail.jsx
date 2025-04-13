import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPostById, deletePost } from '../services/api';

const PostDetail = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await getPostById(id);
        setPost(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch post');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      await deletePost(id);
      navigate('/marketplace');
    } catch (err) {
      alert(`Error: ${err.response?.data?.error || 'Failed to delete post'}`);
    }
  };

  // Main container with full height and centered content
  const containerStyle = "flex justify-center items-center min-h-screen px-4 py-8";

  if (loading) {
    return (
      <div className={containerStyle}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#688268]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerStyle}>
        <div className="bg-red-50 text-red-500 p-4 rounded-md w-full max-w-4xl">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={containerStyle}>
        <div className="text-center py-12 w-full max-w-4xl">
          <h3 className="text-xl font-medium text-gray-600">Post not found</h3>
        </div>
      </div>
    );
  }

  const isOwner = currentUser && currentUser.id === post.userId;

  return (
    <div className={containerStyle}>
      <div className="w-full max-w-4xl">
        <div className="mb-6">
          <Link to="/market" className="text-[#688268] hover:text-[#425442]">
            &larr; Back to Marketplace
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${post.productImage}`}
                alt={post.productName}
                className="w-full max-w-[60%] h-auto mx-auto"
              />
            </div>

            <div className="md:w-1/2 p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{post.productName}</h1>

              <div className="mb-4">
                <span className="text-3xl font-bold text-[#688268]">
                  ${parseFloat(post.price).toFixed(2)}
                </span>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">{post.description}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Location</h2>
                <p className="text-gray-700">{post.place}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Seller Information</h2>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#688268] text-white rounded-full flex items-center justify-center mr-3">
                    {post.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{post.userName}</p>
                    <p className="text-gray-600 text-sm">{post.userEmail}</p>
                  </div>
                </div>
              </div>

              {isOwner && (
                <div className="flex space-x-4">
                  <Link
                    to={`/posts/${post._id}/edit`}
                    className="bg-[#688268] hover:bg-[#425442] text-white font-medium py-2 px-4 rounded-md"
                  >
                    Edit Listing
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md"
                  >
                    Delete Listing
                  </button>
                </div>
              )}

              {!isOwner && (
                <a
                  href={`mailto:${post.userEmail}?subject=Inquiry about ${post.productName}`}
                  className="bg-[#688268] hover:bg-[#425442] text-white font-medium py-2 px-4 rounded-md inline-block"
                >
                  Contact Seller
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;