# test_sustainability_analyzer.py
from ai_analysis_service import SustainabilityAnalyzer
from recommendation_engine import EcoRecommendationEngine

def test_sustainability_analysis():
    analyzer = SustainabilityAnalyzer()
    
    # Test Case 1: Regular product
    print("Testing regular product analysis:")
    result1 = analyzer.analyze_product_description(
        "Cotton t-shirt made in Bangladesh. Machine washable. 100% cotton."
    )
    print(analyzer.format_analysis_for_display(result1))
    
    # Test Case 2: Product with eco claims
    print("\nTesting eco-friendly product analysis:")
    result2 = analyzer.analyze_product_description(
        "Organic cotton t-shirt made with renewable energy in a fair-trade certified facility. "
        "Made with 100% GOTS certified organic cotton. Low-impact dyes. Carbon-neutral shipping."
    )
    print(analyzer.format_analysis_for_display(result2))
    
    # Test Case 3: Product with mixed sustainability aspects
    print("\nTesting mixed sustainability product:")
    result3 = analyzer.analyze_product_description(
        "Recycled polyester jacket with plastic packaging. Made from recycled materials "
        "but shipped internationally with standard shipping."
    )
    print(analyzer.format_analysis_for_display(result3))
    
    # Test greenwashing detection
    print("\nTesting greenwashing detection:")
    result4 = analyzer.identify_greenwashing(
        "Eco-friendly t-shirt made with green technology. Natural materials. Earth-friendly packaging."
    )
    print(analyzer.format_analysis_for_display({
        "greenwashing_risk": result4.get("greenwashing_risk", "N/A"),
        "issues": result4.get("issues", []),
        "explanation": result4.get("explanation", "No explanation provided")
    }))
    
    # Test handling of malformed/unexpected responses
    print("\nTesting error handling with malformed analysis:")
    mock_bad_result = {
        "error": "Malformed response",
        "raw_response": "This is not valid JSON"
    }
    print(analyzer.format_analysis_for_display(mock_bad_result))

def test_recommendation_engine():
    engine = EcoRecommendationEngine()
    
    # Add some products to the database
    print("Adding products to database...")
    id1 = engine.add_product_to_database({
        "name": "Regular Cotton T-shirt",
        "category": "clothing",
        "description": "Cotton t-shirt made in Bangladesh. Machine washable. 100% cotton.",
        "price": 15.99
    })
    
    id2 = engine.add_product_to_database({
        "name": "Organic Cotton T-shirt",
        "category": "clothing",
        "description": "Organic cotton t-shirt made with renewable energy in a fair-trade certified facility. "
        "Made with 100% GOTS certified organic cotton. Low-impact dyes. Carbon-neutral shipping.",
        "price": 29.99
    })
    
    id3 = engine.add_product_to_database({
        "name": "Recycled Polyester Jacket",
        "category": "clothing",
        "description": "Jacket made from 80% recycled plastic bottles. Water-resistant coating without PFCs. "
        "Designed for circularity with easily separable components for recycling at end of life.",
        "price": 89.99
    })
    
    id4 = engine.add_product_to_database({
        "name": "Bamboo Toothbrush",
        "category": "personal care",
        "description": "Biodegradable bamboo toothbrush with plant-based bristles. "
        "Comes in recyclable paper packaging. Carbon-neutral shipping.",
        "price": 4.99
    })
    
    id5 = engine.add_product_to_database({
        "name": "Plastic Bottled Water",
        "category": "beverages",
        "description": "Spring water in single-use plastic bottle. Purified and bottled at source.",
        "price": 1.99
    })
    
    # Test finding alternatives
    print("\nTesting alternative recommendations:")
    alternatives = engine.find_alternatives(
        "Regular cotton t-shirt, made in conventional factory using standard methods.",
        category="clothing"
    )
    print(f"Found {len(alternatives)} alternatives")
    for i, alt in enumerate(alternatives):
        print(f"\nAlternative {i+1}:")
        print(engine.format_alternative_for_display(alt))
    
    # Test product comparison
    print("\nTesting product comparison:")
    comparison = engine.compare_products(id1, id2)
    print(f"Comparing {comparison['product1']['name']} with {comparison['product2']['name']}")
    
    if "differences" in comparison:
        print("\nDifferences:")
        for key, value in comparison["differences"].items():
            if isinstance(value, (int, float)):
                direction = "better" if value > 0 else "worse"
                print(f"- {key}: {abs(value):.1f} points {direction}")
                
    # Test generating eco alternatives from category
    print("\nTesting category-based eco alternatives:")
    suggestions = engine.generate_eco_alternatives_from_category("water bottles")
    
    if suggestions:
        print(f"\nGenerated {len(suggestions)} eco-friendly water bottle suggestions:")
        for i, alt in enumerate(suggestions[:2]):  # Show just first 2 to keep output compact
            print(f"\nSuggestion {i+1}:")
            print(engine.format_alternative_for_display(alt))
    else:
        print("No suggestions generated for category")
        
    # Test ingredient alternatives
    print("\nTesting ingredient alternatives:")
    ingredients = "plastic packaging, synthetic dyes, cotton"
    alternatives = engine.suggest_ingredient_alternatives(ingredients)
    
    if alternatives:
        print(f"Found alternatives for {len(alternatives)} ingredients:")
        for ingredient, alts in alternatives.items():
            print(f"\nFor {ingredient.upper()}:")
            for alt in alts[:1]:  # Show just the first alternative to keep output compact
                print(f"- {alt.get('name', 'Unknown')}")
                print(f"  Benefits: {alt.get('benefits', 'No information')}")
    else:
        print("No ingredient alternatives found")

if __name__ == "__main__":
    print("=== Testing Sustainability Analysis ===")
    test_sustainability_analysis()
    
    print("\n=== Testing Recommendation Engine ===")
    test_recommendation_engine()