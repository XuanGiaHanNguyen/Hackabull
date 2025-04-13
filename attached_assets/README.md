# EcoScan - Sustainability Product Analyzer

A modern web application that analyzes product sustainability using Gemini AI. The application helps you:

- Analyze products for their environmental impact
- Find eco-friendly alternatives
- Detect greenwashing in product descriptions
- Analyze products from images
- Find sustainable alternatives for materials and ingredients

## Features

- Product sustainability analysis with detailed metrics and scores
- Eco-friendly product alternatives with specific recommendations
- Greenwashing detection to identify misleading environmental claims
- Image analysis to identify products and assess their sustainability
- Sustainable material alternatives for common ingredients
- Modern, responsive web interface

## Installation

1. Clone this repository
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file with your Google API key:

```
GOOGLE_API_KEY=your_gemini_api_key
```

## Usage

1. Start the web server:

```bash
python app.py
```

2. Open your browser and navigate to `http://localhost:5000`

3. Use the different sections of the application:
   - **Analyze Product**: Enter a product description to get sustainability metrics
   - **Image Analysis**: Upload a product image for identification and analysis
   - **Browse Categories**: Explore eco-friendly products by category
   - **Material Alternatives**: Find sustainable alternatives for specific materials

## API Endpoints

If you want to use the API directly:

- `/analyze` (POST): Analyze a product description
- `/alternatives` (POST): Find eco-friendly alternatives
- `/greenwashing` (POST): Check for greenwashing
- `/upload_image` (POST): Analyze a product from an image
- `/categories` (GET): Get available product categories
- `/category_products` (POST): Get eco-friendly products in a category
- `/material_alternatives` (POST): Find sustainable material alternatives

## Requirements

- Python 3.8+
- Google Gemini API key (https://ai.google.dev/)
- Flask
- Internet connection for API calls 

.analysis-container {
    font-family: 'Roboto', sans-serif;
    line-height: 1.6;
}

.score-bar {
    height: 12px;
    border-radius: 6px;
    background: #e9ecef;
    margin: 8px 0 20px 0;
    position: relative;
}

.score-fill {
    height: 100%;
    border-radius: 6px;
    background: linear-gradient(90deg, #28a745, #20c997);
} 