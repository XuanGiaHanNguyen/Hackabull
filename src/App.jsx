
import { useState, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import CategoryBrowser from './components/CategoryBrowser';
import Navbar from './components/Navbar';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold mb-4">Image-Based Sustainability Analysis</h1>
            <p className="text-gray-300 text-lg">
              Scan product images to analyze sustainability metrics and find eco-friendly alternatives with AI-powered insights.
            </p>
          </div>
        </div>

        <section id="image-analysis" className="mb-12">
          <ImageUpload />
        </section>

        <section id="categories">
          <CategoryBrowser />
        </section>
      </div>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h5 className="text-xl font-semibold flex items-center">
                <span className="mr-2">🌿</span>
                EcoScan - Image-Based Sustainability Analyzer
              </h5>
              <p className="text-gray-400">Powered by Gemini AI</p>
            </div>
            <p className="text-gray-400 mt-4 md:mt-0">© 2025 EcoScan - All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
