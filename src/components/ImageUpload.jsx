
import { useState } from 'react';

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
            <input 
              type="file" 
              name="image"
              accept="image/*"
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-green-600 file:text-white
                hover:file:bg-green-700"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze Image'}
          </button>
        </form>

        {error && (
          <div className="mt-4 text-red-500 bg-red-100 p-3 rounded">
            {error}
          </div>
        )}

        {results && (
          <div className="mt-6">
            <h4 className="text-xl font-semibold mb-3">Analysis Results</h4>
            <pre className="bg-gray-700 p-4 rounded overflow-x-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
