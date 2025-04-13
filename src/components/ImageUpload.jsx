
import { useState } from 'react';
import AnalysisResults from './AnalysisResults';
import EcoAlternatives from './EcoAlternatives';

export default function ImageUpload() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const imageFile = e.target.image.files[0];

    if (!imageFile) {
      setError('Please select an image to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      formData.append('image', imageFile);
      const response = await fetch('/upload_image', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-4 flex items-center">
          <span className="mr-2">📸</span>
          Analyze Product from Image
        </h3>
        
        <p className="text-gray-400 mb-6">
          Upload a photo of any product to analyze its sustainability factors and find eco-friendly alternatives.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="w-full p-2 rounded bg-gray-700 text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition"
          >
            {loading ? 'Analyzing...' : 'Analyze Image'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded text-red-400">
            {error}
          </div>
        )}
      </div>

      {results && (
        <>
          <AnalysisResults analysis={results.analysis} formatted={results.formatted_analysis} />
          {results.alternatives?.length > 0 && (
            <EcoAlternatives alternatives={results.alternatives} />
          )}
        </>
      )}
    </div>
  );
}
