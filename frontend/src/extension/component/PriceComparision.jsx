import React from 'react'

const PriceComparision = () => {
    const onViewBestPrice = () => {
        const websiteUrl = "http://localhost:5173/product";
        chrome.tabs.create({ url: websiteUrl });
    }

    return (
        <div>
            {/* Price Comparison Header */}
            <h3 className="text-md font-medium text-green-600 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Price Comparison
            </h3>

            {/* Explanation */}
            <p className="text-sm text-gray-700 mb-4">
                We scan top shopping sites like Walmart, Target, eBay, and more to find the same product at the best price — so you can save money effortlessly.
            </p>

            {/* Footer */}
            <div className="mt-4 flex justify-center gap-4">
                <button className="px-3 py-2 bg-green-800 text-white rounded-md font-medium hover:bg-green-900 transition-colors duration-200" onClick={onViewBestPrice}>
                    Visit Best Price
                </button>
            </div>
        </div>
    )
}

export default PriceComparision
