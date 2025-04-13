from flask import Flask, render_template, request, jsonify
from ai_analysis_service import SustainabilityAnalyzer
from recommendation_engine import EcoRecommendationEngine
import os
import json

app = Flask(__name__)

# Initialize the analyzer and recommender
analyzer = SustainabilityAnalyzer()
recommender = EcoRecommendationEngine()

# Initialize sample products database
def init_products():
    print("Initializing product database...")
    recommender.add_product_to_database({
        "name": "Regular Cotton T-shirt",
        "category": "clothing",
        "description": "Cotton t-shirt made in Bangladesh. Machine washable. 100% cotton.",
        "price": 15.99
    })
    
    recommender.add_product_to_database({
        "name": "Organic Cotton T-shirt",
        "category": "clothing",
        "description": "Organic cotton t-shirt made with renewable energy in a fair-trade certified facility. Made with 100% GOTS certified organic cotton. Low-impact dyes. Carbon-neutral shipping.",
        "price": 29.99
    })
    
    recommender.add_product_to_database({
        "name": "Recycled Polyester Jacket",
        "category": "clothing",
        "description": "Jacket made from 80% recycled plastic bottles. Water-resistant coating without PFCs. Designed for circularity with easily separable components for recycling at end of life.",
        "price": 89.99
    })
    
    recommender.add_product_to_database({
        "name": "Bamboo Toothbrush",
        "category": "personal care",
        "description": "Biodegradable bamboo toothbrush with plant-based bristles. Comes in recyclable paper packaging. Carbon-neutral shipping.",
        "price": 4.99
    })
    
    recommender.add_product_to_database({
        "name": "Stainless Steel Water Bottle",
        "category": "beverages",
        "description": "Double-walled stainless steel water bottle, BPA-free, designed to last for years. Eliminates need for single-use plastic bottles. Made with partially recycled steel.",
        "price": 24.99
    })

# Initialize database at startup
init_products()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_product():
    product_description = request.form.get('description', '')
    analysis = analyzer.analyze_product_description(product_description)
    formatted_analysis = analyzer.format_analysis_for_display(analysis)
    
    return jsonify({
        'analysis': analysis,
        'formatted_analysis': formatted_analysis
    })

@app.route('/alternatives', methods=['POST'])
def find_alternatives():
    product_description = request.form.get('description', '')
    category = request.form.get('category', '')
    
    if not category:
        category = None
        
    alternatives = recommender.find_alternatives(product_description, category)
    
    # Convert complex objects to JSON-serializable format
    serializable_alternatives = []
    for alt in alternatives:
        alt_copy = dict(alt)
        if 'product' in alt_copy:
            alt_copy['product'] = dict(alt_copy['product'])
        serializable_alternatives.append(alt_copy)
    
    # Format alternatives for display
    formatted_alternatives = []
    for alt in alternatives:
        formatted_alt = recommender.format_alternative_for_display(alt)
        formatted_alternatives.append({
            'raw': alt,
            'formatted': formatted_alt
        })
    
    return jsonify({
        'alternatives': serializable_alternatives,
        'formatted_alternatives': formatted_alternatives
    })

@app.route('/greenwashing', methods=['POST'])
def check_greenwashing():
    product_description = request.form.get('description', '')
    greenwashing = analyzer.identify_greenwashing(product_description)
    
    return jsonify({
        'greenwashing': greenwashing
    })

@app.route('/categories')
def get_categories():
    # Collect unique categories from database
    categories = set()
    for product in recommender.product_database:
        if "category" in product:
            categories.add(product["category"])
    
    return jsonify({
        'categories': sorted(list(categories))
    })

@app.route('/category_products', methods=['POST'])
def explore_category():
    category = request.form.get('category', '')
    suggestions = recommender.generate_eco_alternatives_from_category(category)
    
    # Convert to JSON-serializable format
    serializable_suggestions = []
    for alt in suggestions:
        alt_copy = dict(alt)
        if 'product' in alt_copy:
            alt_copy['product'] = dict(alt_copy['product'])
        serializable_suggestions.append(alt_copy)
    
    # Format suggestions for display
    formatted_suggestions = []
    for alt in suggestions:
        formatted_alt = recommender.format_alternative_for_display(alt)
        formatted_suggestions.append({
            'raw': alt,
            'formatted': formatted_alt
        })
    
    return jsonify({
        'suggestions': serializable_suggestions,
        'formatted_suggestions': formatted_suggestions
    })

@app.route('/upload_image', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'})
        
    image_file = request.files['image']
    
    if image_file.filename == '':
        return jsonify({'error': 'No image selected'})
    
    # Check file extension
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    if '.' not in image_file.filename or \
       image_file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({'error': 'Invalid file format. Please upload a PNG, JPG, JPEG, GIF or WEBP image.'})
    
    try:
        # Make sure the file is ready for reading
        image_file.seek(0)
        
        # Analyze the image directly without saving it
        print(f"Analyzing image: {image_file.filename}")
        analysis = analyzer.analyze_product_image(image_file)
        
        # Check for errors
        if 'error' in analysis:
            print(f"Image analysis error: {analysis['error']}")
            return jsonify(analysis)
        
        # Format the analysis for display
        formatted_analysis = analyzer.format_image_analysis_for_display(analysis)
        
        # Convert complex objects to JSON-serializable format
        # Replace any non-serializable objects
        def make_serializable(obj):
            if isinstance(obj, dict):
                return {k: make_serializable(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [make_serializable(item) for item in obj]
            elif isinstance(obj, (int, float, str, bool, type(None))):
                return obj
            else:
                return str(obj)
        
        serializable_analysis = make_serializable(analysis)
        
        return jsonify({
            'analysis': serializable_analysis,
            'formatted_analysis': formatted_analysis
        })
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in image analysis: {str(e)}")
        print(error_details)
        return jsonify({
            'error': f'Error analyzing image: {str(e)}',
            'details': 'The image analysis feature requires a properly formatted image file.'
        })

@app.route('/material_alternatives', methods=['POST'])
def material_alternatives():
    materials = request.form.get('materials', '')
    alternatives = recommender.suggest_ingredient_alternatives(materials)
    
    # Ensure the result is serializable
    serializable_alternatives = {}
    for material, alts in alternatives.items():
        serializable_alternatives[material] = [dict(alt) for alt in alts]
    
    return jsonify({
        'alternatives': serializable_alternatives
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0') 