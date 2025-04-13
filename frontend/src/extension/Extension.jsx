import React, { useState, useEffect } from 'react';
import EcoRatingContent from './component/Tag';
import PriceComparision from './component/PriceComparision';

function ExtensionPopup() {
    const [product, setProduct] = useState(null);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [productTitle, setProductTitle] = useState("Product");

    useEffect(() => {
        // Load stored data when popup opens
        chrome.storage.local.get(['currentProduct', 'productTags', 'error'], (result) => {
            if (result.currentProduct) {
                setProduct(result.currentProduct);
                // Try to extract a title from the product data
                if (result.currentProduct.pageType === 'product' && result.currentProduct.products?.[0]?.title) {
                    setProductTitle(result.currentProduct.products[0].title);
                } else if (result.currentProduct.pageTitle) {
                    setProductTitle("Products on " + result.currentProduct.pageTitle);
                }
            }
            if (result.productTags) setTags(result.productTags);
            if (result.error) setError(result.error);
        });

        // Set up a listener for messages from content script
        const messageListener = (message, sender, sendResponse) => {
            if (message.action === "SCAN_COMPLETE") {
                setLoading(false);
                if (message.product) {
                    setProduct(message.product);
                    console.log("Scan complete:", message.product);

                    // Update product title based on scan results
                    if (message.product.pageType === 'product' && message.product.products?.[0]?.title) {
                        setProductTitle(message.product.products[0].title);
                    } else if (message.product.pageTitle) {
                        setProductTitle("Products on " + message.product.pageTitle);
                    }
                }
                if (message.tags) setTags(message.tags);
            } else if (message.action === "SCAN_ERROR") {
                setLoading(false);
                setError(message.error || "Unknown error occurred");
                console.error("Scan error:", message.error);
            }
        };

        chrome.runtime.onMessage.addListener(messageListener);

        // Clean up listener when component unmounts
        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    const handleScanClick = () => {
        setLoading(true);
        setError(null);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]?.id) {
                setLoading(false);
                setError("No active tab found");
                return;
            }

            chrome.tabs.sendMessage(
                tabs[0].id,
                { action: "SCAN_NOW" },
                (response) => {
                    setLoading(false);

                    if (chrome.runtime.lastError) {
                        setError("Error communicating with page. Make sure you're on a supported shopping site.");
                        console.error("Error sending message:", chrome.runtime.lastError);
                        return;
                    }

                    if (response && response.success) {
                        // Just log to console and don't update UI with products
                        console.log("SCAN RESULTS:", response.data);
                        setProductTitle("Scan complete - check console for results");
                    }
                }
            );
        });
    };


    const openWebsite = () => {
        // Replace with your actual website URL
        const websiteUrl = "http://localhost:5173/"; // Change this to your actual URL
        chrome.tabs.create({ url: websiteUrl });
    };


    const [activeTab, setActiveTab] = useState('ecoRating');

    return (
        <div className="p-4 w-96 rounded-lg">
            <div className="flex justify-between items-center">
                <button
                    onClick={openWebsite}
                    className="text-xl font-bold mb-2 text-[#3c5d55] bg-transparent border-none cursor-pointer"
                >
                    🌱GreenCart
                </button>
            </div>

            <div className="my-3">
                <button
                    onClick={handleScanClick}
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded font-medium transition-colors ${loading
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                        : 'bg-green-800 text-white hover:bg-green-900'
                        }`}
                >
                    {loading ? 'Scanning...' : 'Scan Product'}
                </button>
            </div>

            {error && (
                <div className="px-4 py-2 mb-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded">
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    className={`flex-1 py-3 px-5 text-center font-medium ${activeTab === 'ecoRating' ? 'text-gray-900' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('ecoRating')}
                >
                    Eco Rating
                </button>
                <button
                    className={`flex-1 py-3 px-5 text-center font-medium ${activeTab === 'priceCompare' ? 'text-gray-900' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('priceCompare')}
                >
                    Price Compare
                </button>
            </div>

            <div className="flex">
                <div className={`h-1 flex-1 ${activeTab === 'ecoRating' ? 'bg-green-500' : 'bg-transparent'}`}></div>
                <div className={`h-1 flex-1 ${activeTab === 'priceCompare' ? 'bg-green-500' : 'bg-transparent'}`}></div>
            </div>

            <div className="p-5">
                {activeTab === 'ecoRating' ? <EcoRatingContent /> : <PriceComparision />}
            </div>

        </div>
    );
}

export default ExtensionPopup; 