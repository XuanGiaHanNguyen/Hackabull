import React from 'react'

const EcoRatingContent = () => {
    return (
        <div>

            {/* Environmental Impact */}
            <h3 className="text-lg font-medium text-green-600 mb-4">Eco-friendly Tags </h3>
            <ul className="space-y-4">
                <li className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                    🌎
                    </div>
                    <p className="text-green-800 text-md"><span className='font-semibold'>Eco-Friendly</span> – Overall green rating</p>
                </li>
                <li className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                    🥦
                    </div>
                    <p className="text-green-800 text-md"><span className='font-semibold'>Organic Material</span> – Natural and sustainably grown resources</p>
                </li>
                <li className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                    ♻️
                    </div>
                    <p className="text-green-800 text-md"><span className='font-semibold'>Recyclable Packaging</span> - Packaging can be recycled</p>
                </li>
            </ul>

            <h3 className="text-lg font-medium text-green-600 mb-4 mt-6">Non Eco-friendly Tags</h3>
            <ul className="space-y-4">
                <li className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                    🗑️
                    </div>
                    <p className="text-green-800 text-md"><span className='font-semibold'>Single-Use</span> – Designed to be used once and discarded</p>
                </li>
                <li className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                    Co²
                    </div>
                    <p className="text-green-800 text-md"><span className='font-semibold'>High Carbon Footprint</span> – Intensive energy for production or shipping</p>
                </li>
                <li className="flex items-center">
                    <div className="flex-shrink-0 mr-3">
                    🛍️
                    </div>
                    <p className="text-green-800 text-md"><span className='font-semibold'>Plastic Packaging</span> – Excessive or non-recyclable plastic</p>
                </li>
            </ul>

            {/* Footer */}
            <div className="mt-4 flex justify-center gap-3">
                <button className="px-3 py-2 bg-green-800 text-white rounded-md font-medium hover:bg-green-900 transition-colors duration-200">
                    Shop Eco Alternatives
                </button>
            </div>
        </div>
    );
}

export default EcoRatingContent