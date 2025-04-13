# main.py
from ai_analysis_service import SustainabilityAnalyzer, list_available_models
from recommendation_engine import EcoRecommendationEngine
import google.generativeai as genai
import os

def check_gemini_setup():
    print("Checking Gemini API setup...")
    try:
        models = list_available_models()
        if not models:
            print("WARNING: No models found. Check your API key and network connection.")
    except Exception as e:
        print(f"Error checking setup: {e}")

def main():
    check_gemini_setup()
    print("Eco-Friendly Product Analysis & Recommendation System")
    print("===================================================")
    
    analyzer = SustainabilityAnalyzer()
    recommender = EcoRecommendationEngine()
    
    # Initialize database with sample products
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
    
    recommender.add_product_to_database({
        "name": "Recycled Paper Notebook",
        "category": "stationery",
        "description": "Notebook made from 100% post-consumer recycled paper. Plant-based inks. Spiral binding made from recycled aluminum. Carbon-neutral manufacturing process.",
        "price": 8.99
    })
    
    recommender.add_product_to_database({
        "name": "Hemp Backpack",
        "category": "accessories",
        "description": "Durable backpack made from organic hemp fiber. Natural dyes with no toxic chemicals. Fair-trade certified manufacturing. Water-resistant without synthetic coatings.",
        "price": 59.99
    })
    
    # User interaction loop
    while True:
        print("\nOptions:")
        print("1. Analyze a product description")
        print("2. Check for greenwashing")
        print("3. Find eco-friendly alternatives")
        print("4. Suggest alternative materials/ingredients")
        print("5. Explore eco-friendly products by category")
        print("6. Add a new product to database")
        print("7. Analyze product from image")
        print("8. Exit")
        
        choice = input("Enter your choice (1-8): ")
        
        if choice == "1":
            description = input("Enter product description: ")
            analysis = analyzer.analyze_product_description(description)
            
            # Display formatted analysis instead of raw JSON
            print("\nSustainability Analysis:")
            print(analyzer.format_analysis_for_display(analysis))
            
            # Offer to find alternatives if score is low
            if isinstance(analysis, dict) and analysis.get('overall_sustainability_score', 10) < 6:
                find_alt = input("\nThis product has a low sustainability score. Would you like to find eco-friendly alternatives? (y/n): ")
                if find_alt.lower() == 'y':
                    category = input("Enter product category (optional, press Enter to skip): ")
                    category = category if category else None
                    alternatives = recommender.find_alternatives(description, category)
                    
                    print(f"\nFound {len(alternatives)} eco-friendly alternatives:")
                    for i, alt in enumerate(alternatives):
                        print(f"\nALTERNATIVE #{i+1}:")
                        print("-" * 20)
                        print(recommender.format_alternative_for_display(alt))
                        print("-" * 40)
            
        elif choice == "2":
            description = input("Enter product description: ")
            greenwashing = analyzer.identify_greenwashing(description)
            
            # Format greenwashing output
            print("\nGreenwashing Assessment:")
            if isinstance(greenwashing, dict):
                if "greenwashing_risk" in greenwashing:
                    print(f"Greenwashing Risk Score: {greenwashing['greenwashing_risk']}/10")
                if "issues" in greenwashing:
                    print("\nPotential Greenwashing Issues:")
                    for issue in greenwashing["issues"]:
                        print(f"- {issue}")
                if "explanation" in greenwashing:
                    print(f"\nExplanation: {greenwashing['explanation']}")
            else:
                print(greenwashing)
            
        elif choice == "3":
            description = input("Enter product description: ")
            category = input("Enter product category (optional, press Enter to skip): ")
            category = category if category else None
            alternatives = recommender.find_alternatives(description, category)
            
            if alternatives:
                print(f"\nFound {len(alternatives)} eco-friendly alternatives:")
                for i, alt in enumerate(alternatives):
                    print(f"\nALTERNATIVE #{i+1}:")
                    print("-" * 20)
                    print(recommender.format_alternative_for_display(alt))
                    print("-" * 40)
            else:
                print("\nNo specific alternatives found. Here are some general suggestions:")
                # Generate generic alternatives when none are found
                generic_suggestions = recommender.generate_eco_alternatives_from_category(
                    category or "general product", 
                    ["Low sustainability score", "Consider eco-friendly materials"]
                )
                
                for i, alt in enumerate(generic_suggestions):
                    print(f"\nSUGGESTION #{i+1}:")
                    print("-" * 20)
                    print(recommender.format_alternative_for_display(alt))
                    print("-" * 40)
                
        elif choice == "4":
            ingredients = input("Enter materials or ingredients to find eco-alternatives for (comma separated): ")
            alternatives = recommender.suggest_ingredient_alternatives(ingredients)
            
            print("\nEco-Friendly Material/Ingredient Alternatives:")
            print("=" * 50)
            
            if alternatives:
                for original, alts in alternatives.items():
                    print(f"\nFor {original.upper()}:")
                    print("-" * 20)
                    
                    for i, alt in enumerate(alts):
                        print(f"Alternative {i+1}: {alt.get('name', 'Unknown')}")
                        print(f"Benefits: {alt.get('benefits', 'No information')}")
                        print(f"Considerations: {alt.get('considerations', 'No information')}")
                        print()
            else:
                print("No specific alternatives could be generated. Please try different materials or ingredients.")
                
        elif choice == "5":
            print("\nExplore eco-friendly products by category")
            print("Available categories:")
            
            # Collect unique categories from database
            categories = set()
            for product in recommender.product_database:
                if "category" in product:
                    categories.add(product["category"])
            
            # Display available categories
            for i, category in enumerate(sorted(categories)):
                print(f"{i+1}. {category}")
            
            # Allow custom category input
            print(f"{len(categories)+1}. Other (specify)")
            
            cat_choice = input(f"Select a category (1-{len(categories)+1}): ")
            
            try:
                choice_idx = int(cat_choice) - 1
                if 0 <= choice_idx < len(categories):
                    selected_category = sorted(categories)[choice_idx]
                else:
                    selected_category = input("Enter your desired product category: ")
            except ValueError:
                selected_category = input("Enter your desired product category: ")
            
            # Generate suggestions for this category
            print(f"\nGenerating eco-friendly {selected_category} suggestions...")
            suggestions = recommender.generate_eco_alternatives_from_category(selected_category)
            
            if suggestions:
                print(f"\nTop eco-friendly {selected_category} recommendations:")
                for i, alt in enumerate(suggestions):
                    print(f"\nRECOMMENDATION #{i+1}:")
                    print("-" * 20)
                    print(recommender.format_alternative_for_display(alt))
                    print("-" * 40)
            else:
                print(f"Unable to generate specific recommendations for {selected_category}")
                
        elif choice == "6":
            name = input("Enter product name: ")
            category = input("Enter product category: ")
            description = input("Enter product description: ")
            price = float(input("Enter product price: "))
            
            product_id = recommender.add_product_to_database({
                "name": name,
                "category": category,
                "description": description,
                "price": price
            })
            
            print(f"Product added with ID: {product_id}")
            product = recommender.product_database[product_id]
            print("\nProduct Analysis:")
            print(analyzer.format_analysis_for_display(product.get('sustainability_metrics', {})))
            
        elif choice == "7":
            # Image analysis
            image_path = input("Enter path to product image: ")
            
            # Check if file exists
            if not os.path.exists(image_path):
                print(f"Error: File '{image_path}' not found.")
                continue
                
            print("\nAnalyzing product image...")
            analysis = analyzer.analyze_product_image(image_path)
            
            # Display formatted image analysis
            print("\nImage Analysis Results:")
            print(analyzer.format_image_analysis_for_display(analysis))
            
            # If product was identified, offer to find alternatives
            if isinstance(analysis, dict) and "image_analysis" in analysis and "product_name" in analysis["image_analysis"]:
                product_name = analysis["image_analysis"]["product_name"]
                find_alt = input(f"\nWould you like to find eco-friendly alternatives for '{product_name}'? (y/n): ")
                
                if find_alt.lower() == 'y':
                    # Create description from image analysis
                    if "description" in analysis["image_analysis"]:
                        description = f"{product_name}. {analysis['image_analysis']['description']}"
                    else:
                        description = product_name
                        
                    # Get category if possible
                    category = input("Enter product category (optional, press Enter to skip): ")
                    category = category if category else None
                    
                    # Find alternatives
                    alternatives = recommender.find_alternatives(description, category)
                    
                    if alternatives:
                        print(f"\nFound {len(alternatives)} eco-friendly alternatives:")
                        for i, alt in enumerate(alternatives):
                            print(f"\nALTERNATIVE #{i+1}:")
                            print("-" * 20)
                            print(recommender.format_alternative_for_display(alt))
                            print("-" * 40)
                    else:
                        print("\nNo specific alternatives found. Here are some general suggestions:")
                        # Generate generic alternatives
                        generic_suggestions = recommender.generate_eco_alternatives_from_category(
                            category or "general product", 
                            ["Consider eco-friendly materials"]
                        )
                        
                        for i, alt in enumerate(generic_suggestions):
                            print(f"\nSUGGESTION #{i+1}:")
                            print("-" * 20)
                            print(recommender.format_alternative_for_display(alt))
                            print("-" * 40)
            
        elif choice == "8":
            print("Exiting program. Goodbye!")
            break
            
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()