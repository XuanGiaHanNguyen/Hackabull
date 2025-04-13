import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import banner from "../assets/bg/banner1.png";
import { SeedIcon, MenuIcon } from "../assets/icon";
import { isAuthenticated, logoutUser } from "./Auth/authService";
import { getPosts, createPost } from '../services/api';
import PostCard from '../component/PostCard';
import { useNavigate } from "react-router-dom";

const Marketplace = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [budget, setBudget] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const navigate = useNavigate()
    
    // Create Post Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        productName: '',
        price: '',
        place: '',
        description: '',
        productImage: null,
    });

    // Check authentication status when component mounts
    useEffect(() => {
      const checkAuth = () => {
        const loggedIn = isAuthenticated();
        setIsLoggedIn(loggedIn);
        
        if (loggedIn) {
          // Get user data from localStorage
          try {
            const userData = JSON.parse(localStorage.getItem('userData'));
            setUser(userData);
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }
      };
      checkAuth();
    }, []);

    // Fetch posts when component mounts
    useEffect(() => {
      fetchPosts();
    }, []);
    
    // Update filtered posts when search term or posts change
    useEffect(() => {
      if (posts.length > 0) {
        filterPosts();
      }
    }, [searchTerm, posts]);

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await getPosts();
        const fetchedPosts = response.data.data;
        setPosts(fetchedPosts);
        setFilteredPosts(fetchedPosts); // Initially show all posts
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    // Filter posts based on search term
    const filterPosts = () => {
      if (!searchTerm) {
        setFilteredPosts(posts);
        return;
      }
      
      const filtered = posts.filter(post => 
        post.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPosts(filtered);
    };

    const handleLogout = () => {
      logoutUser();
      setIsLoggedIn(false);
      setUser(null);
    };
    
    // Search handlers
    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
    };
    
    const handleSearch = () => {
      filterPosts();
    };
    
    // Modal functions
    const openModal = () => {
      if (!isLoggedIn) {
        // Redirect to login or show login prompt
        alert("Please sign in to create a post");
        return;
      }
      setIsModalOpen(true);
    };

    const closeModal = () => {
      setIsModalOpen(false);
      // Reset form
      setFormData({
        productName: '',
        price: '',
        place: '',
        description: '',
        productImage: null,
      });
      setFormError('');
    };
    
    // Form handlers
    const handleFormChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };
    
    const handleFileChange = (e) => {
      setFormData({
        ...formData,
        productImage: e.target.files[0],
      });
    };
    
    const handleFormSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      setFormError('');
      
      try {
        const form = new FormData();
        
        // Add user data
        form.append('userId', user?.id || user?._id);
        form.append('userName', user?.name || user?.email.split('@')[0]);
        form.append('userEmail', user?.email);
        
        // Add product data
        form.append('productName', formData.productName);
        form.append('price', formData.price);
        form.append('place', formData.place);
        form.append('description', formData.description);
        
        // Add image if it exists
        if (formData.productImage) {
          form.append('productImage', formData.productImage);
        }
        
        await createPost(form);
        
        // Close modal and refresh posts
        closeModal();
        fetchPosts();
      } catch (err) {
        setFormError(err.response?.data?.error || 'Error creating post');
      } finally {
        setIsSubmitting(false);
      }
    };
    
    // Filter states
    const [selectedShops, setSelectedShops] = useState([]);
    const [selectedRating, setSelectedRating] = useState(0);
    
    const handleShopFilter = (shop) => {
      if (selectedShops.includes(shop)) {
        setSelectedShops(selectedShops.filter(s => s !== shop));
      } else {
        setSelectedShops([...selectedShops, shop]);
      }
    };
    
    // Render loading state
    const renderLoading = () => (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#688268]"></div>
      </div>
    );

    // Render error state
    const renderError = () => (
      <div className="bg-red-50 text-red-500 p-4 rounded-md">
        Error: {error}
      </div>
    );

    // Render empty state
    const renderEmpty = () => (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-600">No listings found</h3>
        <p className="text-gray-500 mt-2">
          {searchTerm ? `No results for "${searchTerm}". Try a different search term.` : 'Be the first to create a listing!'}
        </p>
      </div>
    );

    // Modal for creating posts
    const renderCreatePostModal = () => (
      <>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="max-w-2xl w-full mx-4 p-6 bg-white rounded-lg shadow-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#4d6b5a]">Create New Listing</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              {formError && (
                <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-md">
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleFormSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2 text-left" htmlFor="productName">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#688268]"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2 text-left" htmlFor="price">
                    Price *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#688268]"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2 text-left" htmlFor="place">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="place"
                    name="place"
                    value={formData.place}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#688268]"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2 text-left" htmlFor="description">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#688268]"
                    required
                  ></textarea>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 font-bold mb-2 text-left" htmlFor="productImage">
                    Product Image *
                  </label>
                  <input
                    type="file"
                    id="productImage"
                    name="productImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#688268]"
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#688268] hover:bg-[#425442] text-white font-bold py-2 px-4 rounded-md focus:outline-none disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );

    return (
      <div className="flex items-center justify-center transition-all duration-1000 ease-in-out relative">
        <div className="relative z-10 text-center w-full flex flex-col min-h-screen">
          {/* Nav Bar */}
          <div className="flex flex-row justify-between px-10 items-center py-3 shadow-b-xl bg-[#4d6b5a]">
              {/* Icon */}
              <Link to="/" className="flex flex-row">
                  {SeedIcon} 
                  <h1 className="font-bold text-2xl text-neutral-300">GreenCart</h1>
              </Link>
              <div className="flex flex-row gap-4">
                  {isLoggedIn ? (
                    <>
                      {/* Display user email or name if available */}
                      {user && (
                        <span className="text-neutral-300 mr-2 mt-1 font-semibold hover:underline" onClick={() => navigate("/search")}>
                          Price Comparision
                        </span>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="font-semibold px-5 py-1 text-neutral-300 rounded-lg hover:scale-110"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className="font-semibold px-5 py-1 text-neutral-300 rounded-lg hover:scale-110">
                      Sign In
                    </Link>
                  )}
                  <div>
                      {MenuIcon}
                  </div>
              </div>
          </div>
  
          {/* Hero Section - Fixed height issue */}
          <div
            className="flex flex-col items-center justify-center text-center py-16"
            style={{
              backgroundImage: `url(${banner})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <h1 className="text-7xl font-medium mb-8 text-[rgba(93,64,55,0.9)]">
              <span className="font-bold text-[#353c2a]">Marketplace</span>
            </h1>
            
            <div className="flex rounded-full bg-white shadow-lg overflow-hidden max-w-4xl w-full mx-4">
              <div className="flex-grow flex items-center">
                <svg className="w-5 h-5 text-gray-400 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input 
                  type="text" 
                  className="flex-grow py-3 px-6 outline-none text-base"
                  placeholder="Search for items by name..." 
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              
              <div className="border-l border-gray-200">
                <select 
                  className="h-full py-3 px-6 outline-none text-gray-600 appearance-none bg-white cursor-pointer pr-8"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                >
                  <option value="">Budget Range</option>
                  <option value="500-1000">$5 - $10</option>
                  <option value="1000-1500">$10 - $50</option>
                  <option value="1500-2000">$50 - $100</option>
                  <option value="2000-2500">$100 - $250</option>
                  <option value="2500+">$250+</option>
                </select>
              </div>
              
              <button 
                className="bg-[#688268] hover:bg-[#425442] text-white px-6 py-3 font-medium text-sm uppercase tracking-wider"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
          </div>

          {/* Modified Filter and Items Display Section */}
          <div className="bg-[#eae9e3] flex flex-row flex-1">
            {/* Filter Section */}
            <div className="w-1/4 p-4 flex flex-col gap-4">

              <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-[#4d6b5a]">
                    Retailer
                </h2>
                <button 
                  onClick={openModal}
                  className="bg-[#4d6b5a] text-white px-4 py-2 rounded-lg hover:bg-[#3c5548] transition"
                >
                  Create Post
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 ">
                <h2 className="text-2xl font-semibold text-[#4d6b5a] mb-4 text-left">
                  Filter
                </h2>
                
                {/* Shop Site Filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-left text-[#5D4037]">
                    Shop Site
                  </h3>
                  <div className="space-y-2 text-left">
                    {['GreenEarth', 'EcoLiving', 'EcoTech'].map((shop) => (
                      <div key={shop} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={shop} 
                          className="h-4 w-4 text-[#688268] rounded"
                          checked={selectedShops.includes(shop)}
                          onChange={() => handleShopFilter(shop)}
                        />
                        <label htmlFor={shop} className="ml-2 text-gray-700">{shop}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Rating Filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-left text-[#5D4037]">
                    Rating
                  </h3>
                  <div className="space-y-2 text-left">
                    {[4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center">
                        <input 
                          type="radio" 
                          id={`rating-${rating}`} 
                          name="rating"
                          className="h-4 w-4 text-[#688268]"
                          checked={selectedRating === rating}
                          onChange={() => setSelectedRating(rating)}
                        />
                        <label htmlFor={`rating-${rating}`} className="ml-2 text-gray-700">
                          {rating}+ Stars
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Price Range Filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3 text-left text-[#5D4037]">
                    Price Range
                  </h3>
                  <input 
                    type="range" 
                    min="0" 
                    max="250" 
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-600">$0</span>
                    <span className="text-sm text-gray-600">$250+</span>
                  </div>
                </div>
                
                {/* Apply Filter Button */}
                <button className="w-full bg-[#688268] hover:bg-[#425442] text-white py-2 rounded-lg font-medium">
                  Apply Filters
                </button>
              </div>
            </div>
            
            {/* Products Display Section with PostList integrated */}
            <div className="w-3/4 p-4">
              <div className="bg-white rounded-xl shadow-md p-6 h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-[#4d6b5a] text-left">
                    Products {searchTerm && `(Searching for: "${searchTerm}")`}
                  </h2>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">Sort by:</span>
                    <select className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#688268]">
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Rating</option>
                      <option>Newest</option>
                    </select>
                  </div>
                </div>
                
                {/* Integrated PostList */}
                {loading ? renderLoading() : 
                  error ? renderError() : 
                  filteredPosts.length === 0 ? renderEmpty() : 
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))}
                  </div>
                }
                
                {/* Pagination */}
                {!loading && !error && filteredPosts.length > 0 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
                        &laquo; Prev
                      </button>
                      <button className="px-3 py-1 bg-[#688268] text-white rounded-md">1</button>
                      <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">2</button>
                      <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">3</button>
                      <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100">
                        Next &raquo;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Create Post Modal */}
        {renderCreatePostModal()}
      </div>
    );
};

export default Marketplace;