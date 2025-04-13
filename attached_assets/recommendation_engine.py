# recommendation_engine.py
from ai_analysis_service import SustainabilityAnalyzer
import google.generativeai as genai
import os
import re
import json

class EcoRecommendationEngine:
    def __init__(self):
        self.analyzer = SustainabilityAnalyzer()
        # In a real application, you might have a database of products
        # For demo purposes, we'll use a simple in-memory list
        self.product_database = []
        
        # Initialize the generative AI model for alternative suggestions
        try:
            self.model = self.analyzer.model  # Reuse the model from the analyzer
        except Exception as e:
            print(f"Error initializing model for recommendations: {e}")
            # Fall back to a newer model
            try:
                # Use gemini-2.0-flash as requested by the user
                self.model = genai.GenerativeModel('gemini-2.0-flash')
                print("Using gemini-2.0-flash for recommendations")
            except:
                # Last resort
                print("Falling back to gemini-1.5-pro")
                self.model = genai.GenerativeModel('gemini-1.5-pro')
    
    def add_product_to_database(self, product_info):
        """Add a product to the database with its sustainability analysis"""
        if 'description' in product_info:
            analysis = self.analyzer.analyze_product_description(product_info['description'])
            product_info['sustainability_metrics'] = analysis
        
        self.product_database.append(product_info)
        return len(self.product_database) - 1  # Return the index of the added product
    
    def find_alternatives(self, product_description, category=None, min_score=6):
        """Find eco-friendly alternatives to a given product"""
        # Analyze the input product
        target_analysis = self.analyzer.analyze_product_description(product_description)
        
        # In a real application, you would query a database
        # For demo purposes, we'll filter our in-memory list
        alternatives = []
        
        for product in self.product_database:
            if 'sustainability_metrics' not in product:
                continue
                
            metrics = product['sustainability_metrics']
            
            # Skip if category doesn't match (when specified)
            if category and product.get('category') != category:
                continue
                
            # Only include products with better sustainability scores
            overall_score = 0
            if isinstance(metrics, dict):
                overall_score = metrics.get('overall_sustainability_score', 0)
                if isinstance(overall_score, str):
                    try:
                        overall_score = float(overall_score)
                    except ValueError:
                        overall_score = 0
            
            target_score = 0
            if isinstance(target_analysis, dict):
                target_score = target_analysis.get('overall_sustainability_score', 0)
                if isinstance(target_score, str):
                    try:
                        target_score = float(target_score)
                    except ValueError:
                        target_score = 0
            
            if overall_score >= min_score and overall_score > target_score:
                # Calculate improvement reasons
                improvement_reasons = self.calculate_improvement_reasons(target_analysis, metrics)
                
                alternatives.append({
                    'product': product,
                    'improvement': overall_score - target_score,
                    'improvement_reasons': improvement_reasons
                })
        
        # Sort by improvement score (descending)
        alternatives.sort(key=lambda x: x['improvement'], reverse=True)
        
        # If no alternatives found in database, generate suggestions
        if not alternatives and isinstance(target_analysis, dict):
            generated_alternatives = self.generate_eco_alternatives(product_description, target_analysis, category)
            alternatives.extend(generated_alternatives)
            
        return alternatives
    
    def calculate_improvement_reasons(self, original_metrics, alternative_metrics):
        """Calculate specific reasons why an alternative is better"""
        reasons = []
        
        # Check key sustainability metrics
        metric_keys = ["materials_sustainability", "manufacturing_process", 
                       "carbon_footprint", "recyclability"]
        
        for key in metric_keys:
            orig_val = self._get_metric_value(original_metrics, key)
            alt_val = self._get_metric_value(alternative_metrics, key)
            
            if alt_val > orig_val and alt_val >= 6:  # Significant improvement
                improvement = alt_val - orig_val
                reason = f"Better {key.replace('_', ' ')}: +{improvement:.1f} points"
                reasons.append(reason)
        
        # Check for better sustainability tags
        orig_tags = original_metrics.get('sustainability_tags', {})
        alt_tags = alternative_metrics.get('sustainability_tags', {})
        
        # Better tags that were added
        for tag, value in alt_tags.items():
            if value and (tag not in orig_tags or not orig_tags.get(tag)):
                if tag in ["Eco-Friendly", "Organic Material", "Recyclable Packaging"]:
                    reasons.append(f"Has {tag}")
        
        # Harmful tags that were removed
        for tag, value in orig_tags.items():
            if value and (tag not in alt_tags or not alt_tags.get(tag)):
                if tag in ["Single-Use", "Plastic Packaging", "High Carbon Footprint"]:
                    reasons.append(f"Eliminates {tag}")
        
        return reasons
    
    def _get_metric_value(self, metrics, key):
        """Helper method to extract numeric metric values safely"""
        if not isinstance(metrics, dict):
            return 0
            
        value = metrics.get(key, 0)
        if isinstance(value, str):
            try:
                return float(value)
            except ValueError:
                return 0
        elif isinstance(value, (int, float)):
            return float(value)
        return 0
    
    def generate_eco_alternatives(self, product_description, analysis, category=None):
        """Generate eco-friendly alternatives using AI when no database matches are found"""
        # Create prompt to generate alternatives
        category_str = f" in the {category} category" if category else ""
        
        # Identify sustainability issues
        issues = []
        if isinstance(analysis, dict):
            # Check low scores
            for key in ["materials_sustainability", "manufacturing_process", 
                      "carbon_footprint", "recyclability"]:
                score = self._get_metric_value(analysis, key)
                if score < 5:
                    issues.append(f"Low {key.replace('_', ' ')} score: {score}/10")
            
            # Check problematic tags
            if 'sustainability_tags' in analysis:
                tags = analysis['sustainability_tags']
                for tag in ["Single-Use", "Plastic Packaging", "High Carbon Footprint"]:
                    if tags.get(tag, False):
                        issues.append(f"Has {tag}")
        
        issues_str = "\n".join([f"- {issue}" for issue in issues]) if issues else "No specific issues identified"
        
        prompt = f"""
        Generate 3 specific eco-friendly alternatives for this product{category_str}:
        
        PRODUCT DESCRIPTION:
        {product_description}
        
        SUSTAINABILITY ISSUES:
        {issues_str}
        
        For each alternative, include:
        1. A product name
        2. A detailed description focusing on sustainable features
        3. An estimated price range (as a number or range like 15.99 or 20-30)
        4. At least 3 specific sustainability improvements over the original
        5. A hypothetical overall sustainability score (1-10)
        
        Format as a structured JSON array of alternatives, with each alternative having these fields:
        - name: Product name
        - description: Detailed description
        - price: Estimated price as a number (not string)
        - category: Product category (same as input or best guess)
        - overall_sustainability_score: Overall score (number)
        - improvement_reasons: Array of specific improvement strings
        
        Example format WITHOUT USING STRING FORMATTING:
        [
          {{
            "name": "Eco Product Name",
            "description": "Detailed eco description",
            "price": 19.99,
            "category": "category_name",
            "overall_sustainability_score": 8.5,
            "improvement_reasons": ["Better materials: +4 points", "Eliminates Plastic Packaging"]
          }}
        ]
        """
        
        try:
            response = self.model.generate_content(prompt)
            import json
            import re
            
            # Try to extract JSON from the response
            response_text = response.text
            
            # Find JSON pattern (anything between square brackets)
            json_pattern = r'\[.*?\]'
            json_matches = re.findall(json_pattern, response_text, re.DOTALL)
            
            if json_matches:
                # Use the longest match (most likely the complete JSON)
                json_str = max(json_matches, key=len)
                
                # Clean up potential JSON issues
                json_str = json_str.replace("'", '"')  # Replace single quotes with double quotes
                
                # Handle price strings (convert "$20" or "20-30" to numbers)
                def price_replacer(match):
                    price_str = match.group(1)
                    # If it has a dollar sign or range, just use a default value
                    if '$' in price_str or '-' in price_str:
                        return '"price": 19.99'
                    return f'"price": {price_str}'
                
                json_str = re.sub(r'"price":\s*"([^"]*)"', price_replacer, json_str)
                
                try:
                    alternatives_data = json.loads(json_str)
                    
                    # Transform to the same format as database alternatives
                    generated_alternatives = []
                    for alt_data in alternatives_data:
                        # Handle price if it's still a string somehow
                        price = alt_data.get("price", 0.0)
                        if isinstance(price, str):
                            try:
                                price = float(re.sub(r'[^\d.]', '', price))
                            except:
                                price = 19.99  # Default price
                        
                        # Create a product object
                        product = {
                            "name": alt_data.get("name", "Suggested Alternative"),
                            "category": alt_data.get("category", category or "unknown"),
                            "description": alt_data.get("description", ""),
                            "price": price,
                            "sustainability_metrics": {
                                "overall_sustainability_score": alt_data.get("overall_sustainability_score", 7.0),
                                "generated": True  # Flag to indicate this is a generated suggestion
                            }
                        }
                        
                        generated_alternatives.append({
                            "product": product,
                            "improvement": alt_data.get("overall_sustainability_score", 7.0) - self._get_metric_value(analysis, "overall_sustainability_score"),
                            "improvement_reasons": alt_data.get("improvement_reasons", []),
                            "generated": True  # Flag to indicate this is a generated suggestion
                        })
                    
                    return generated_alternatives
                except json.JSONDecodeError as e:
                    print(f"JSON error: {e}, trying to fix the JSON")
                    # Try with a more aggressive approach to fix the JSON
                    json_str = re.sub(r'(\w+):', r'"\1":', json_str)  # Quote all keys
                    json_str = re.sub(r':\s*"([^"]*)"', lambda m: f': "{m.group(1).replace("\"", "")}"', json_str)  # Fix nested quotes
                    
                    try:
                        alternatives_data = json.loads(json_str)
                        # Same processing as above
                        generated_alternatives = []
                        for alt_data in alternatives_data:
                            # Default product fallback if parsing still has issues
                            product = {
                                "name": "Eco-Friendly Alternative",
                                "category": category or "unknown",
                                "description": "A sustainable alternative with eco-friendly materials and reduced environmental impact.",
                                "price": 19.99,
                                "sustainability_metrics": {
                                    "overall_sustainability_score": 7.0,
                                    "generated": True
                                }
                            }
                            
                            generated_alternatives.append({
                                "product": product,
                                "improvement": 2.0,
                                "improvement_reasons": ["Better materials", "Lower environmental impact", "Sustainable manufacturing"],
                                "generated": True
                            })
                        
                        return generated_alternatives
                    except:
                        # Last resort fallback
                        return self._generate_fallback_alternatives(category or "product")
            else:
                # No JSON found, use fallback
                return self._generate_fallback_alternatives(category or "product")
                
        except Exception as e:
            print(f"Error generating alternatives: {e}")
            return self._generate_fallback_alternatives(category or "product")
            
    def _generate_fallback_alternatives(self, category):
        """Generate generic fallback alternatives when parsing fails"""
        # Create 2 generic alternatives for the category
        alternatives = []
        
        # First alternative - recycled/upcycled version
        product1 = {
            "name": f"Recycled {category.title()}",
            "category": category,
            "description": f"Made from 100% recycled materials with minimal processing. Designed for durability and end-of-life recyclability.",
            "price": 19.99,
            "sustainability_metrics": {
                "overall_sustainability_score": 8.0,
                "generated": True
            }
        }
        
        alternatives.append({
            "product": product1,
            "improvement": 3.0,
            "improvement_reasons": ["Made from recycled materials", "Reduced virgin resource use", "Designed for recyclability"],
            "generated": True
        })
        
        # Second alternative - organic/biodegradable version
        product2 = {
            "name": f"Organic {category.title()}",
            "category": category,
            "description": f"Made from 100% organic and biodegradable materials. Carbon-neutral manufacturing and biodegradable packaging.",
            "price": 24.99,
            "sustainability_metrics": {
                "overall_sustainability_score": 8.5,
                "generated": True
            }
        }
        
        alternatives.append({
            "product": product2,
            "improvement": 3.5,
            "improvement_reasons": ["Organic materials", "Biodegradable components", "Carbon-neutral manufacturing"],
            "generated": True
        })
        
        return alternatives

    def compare_products(self, product_id1, product_id2):
        """Compare sustainability metrics between two products"""
        if product_id1 >= len(self.product_database) or product_id2 >= len(self.product_database):
            return {"error": "Product ID not found"}
            
        product1 = self.product_database[product_id1]
        product2 = self.product_database[product_id2]
        
        comparison = {
            "product1": {
                "name": product1.get('name', 'Unknown'),
                "metrics": product1.get('sustainability_metrics', {})
            },
            "product2": {
                "name": product2.get('name', 'Unknown'),
                "metrics": product2.get('sustainability_metrics', {})
            },
            "differences": {}
        }
        
        # Calculate differences in metrics
        metrics1 = product1.get('sustainability_metrics', {})
        metrics2 = product2.get('sustainability_metrics', {})
        
        all_keys = set(metrics1.keys()) | set(metrics2.keys())
        for key in all_keys:
            if key in metrics1 and key in metrics2:
                # Both products have this metric
                try:
                    val1 = float(metrics1[key]) if isinstance(metrics1[key], (int, float, str)) else 0
                    val2 = float(metrics2[key]) if isinstance(metrics2[key], (int, float, str)) else 0
                    comparison["differences"][key] = val2 - val1
                except:
                    comparison["differences"][key] = "Not comparable"
        
        return comparison
    
    def generate_eco_alternatives_from_category(self, category, sustainability_issues=None):
        """Generate eco-friendly alternatives for a product category with specific issues"""
        if not sustainability_issues:
            sustainability_issues = ["No specific issues identified"]
        
        issues_str = "\n".join([f"- {issue}" for issue in sustainability_issues])
        
        prompt = f"""
        You are an expert sustainable product advisor. Your task is to recommend highly specific eco-friendly products in a particular category.
        
        PRODUCT CATEGORY: {category}
        
        SUSTAINABILITY ISSUES TO ADDRESS:
        {issues_str}
        
        Generate 3 SPECIFIC eco-friendly products with real brand names when possible. For each product:
        1. Provide a specific product name (e.g., "Patagonia Recycled Down Jacket" not just "Eco Jacket")
        2. Write a detailed description highlighting sustainable materials, manufacturing processes, certifications, etc.
        3. Include an accurate price estimate
        4. List at least 5 specific sustainability features
        5. Rate its overall sustainability score (1-10)
        6. Add a fictional product URL starting with "https://eco-store.example.com/"
        
        YOUR RESPONSE MUST BE VALID JSON. Format exactly as this JSON array:
        [
          {{
            "name": "Specific Product Name 1",
            "description": "Detailed description mentioning brands, materials, etc.",
            "price": 39.99,
            "category": "{category}",
            "overall_sustainability_score": 8.5,
            "sustainability_features": [
              "Made from 100% organic cotton certified by GOTS",
              "Zero-waste manufacturing process",
              "Water-based dyes without harmful chemicals",
              "Fair-trade certified production facility in Portugal",
              "Carbon-neutral shipping and plastic-free packaging"
            ],
            "product_url": "https://eco-store.example.com/products/product-name-1"
          }},
          ... 2 more products ...
        ]
        
        CRITICAL: Provide ONLY valid JSON with NO explanatory text. The response must be machine-parsable.
        """
        
        try:
            response = self.model.generate_content(prompt)
            import json
            import re
            
            # Try to extract JSON from the response
            response_text = response.text
            
            # More robust JSON extraction
            try:
                # First try direct JSON loading if response is clean
                try:
                    # Clean any markdown code blocks or extra text
                    cleaned_text = self._clean_json_string(response_text)
                    alternatives_data = json.loads(cleaned_text)
                    if not isinstance(alternatives_data, list):
                        raise ValueError("Response is not a JSON array")
                except json.JSONDecodeError:
                    # Find JSON pattern (anything between square brackets)
                    json_pattern = r'\[[\s\S]*?\]'  # Changed to handle multiline better
                    json_matches = re.findall(json_pattern, response_text, re.DOTALL)
                    
                    if json_matches:
                        # Use the longest match (most likely the complete JSON)
                        json_str = max(json_matches, key=len)
                        # Clean the JSON to fix common issues
                        json_str = self._clean_json_string(json_str)
                        alternatives_data = json.loads(json_str)
                    else:
                        # Last resort: try to manually construct a simple JSON array
                        alt_pattern = r'"name":\s*"([^"]+)"'
                        alt_matches = re.findall(alt_pattern, response_text)
                        
                        if alt_matches:
                            # Create simple alternatives with just names
                            alternatives_data = []
                            for name in alt_matches:
                                alternatives_data.append({
                                    "name": name,
                                    "description": f"Eco-friendly {category} product",
                                    "price": 29.99,
                                    "category": category,
                                    "overall_sustainability_score": 8.0,
                                    "sustainability_features": ["Sustainable materials", "Energy efficient", "Recyclable packaging"],
                                    "product_url": f"https://eco-store.example.com/products/{name.lower().replace(' ', '-')}"
                                })
                        else:
                            raise ValueError("Could not extract alternative products from response")
                
                # Transform to the format expected by the application
                generated_alternatives = []
                for alt_data in alternatives_data:
                    # Create a product object
                    product = {
                        "name": alt_data.get("name", "Suggested Alternative"),
                        "category": category,
                        "description": alt_data.get("description", ""),
                        "price": alt_data.get("price", 0.0),
                        "sustainability_metrics": {
                            "overall_sustainability_score": alt_data.get("overall_sustainability_score", 7.0),
                            "sustainability_features": alt_data.get("sustainability_features", []),
                            "generated": True  # Flag to indicate this is a generated suggestion
                        }
                    }
                    
                    # Create improvement reasons based on features
                    improvement_reasons = alt_data.get("sustainability_features", [])
                    
                    generated_alternatives.append({
                        "product": product,
                        "improvement": 0,  # No direct comparison available
                        "improvement_reasons": improvement_reasons,
                        "product_url": alt_data.get("product_url", f"https://eco-store.example.com/products/{alt_data.get('name', 'eco-product').lower().replace(' ', '-')}"),
                        "generated": True  # Flag to indicate this is a generated suggestion
                    })
                
                return generated_alternatives
            except Exception as e:
                print(f"Error parsing JSON response for category: {e}")
                # Return fallback alternatives
                return self._generate_fallback_alternatives(f"{category} product", category)
                
        except Exception as e:
            print(f"Error generating alternatives: {e}")
            # Return fallback alternatives
            return self._generate_fallback_alternatives(f"{category} product", category)

    def _clean_json_string(self, json_str):
        """Clean up JSON string to fix common formatting issues"""
        # Remove any markdown code block markers
        json_str = re.sub(r'```json|```', '', json_str.strip())
        
        # Find where JSON might begin (look for first '[')
        start_idx = json_str.find('[')
        if start_idx == -1:
            return "[]"
            
        # Find where JSON might end (look for last ']')
        end_idx = json_str.rfind(']')
        if end_idx == -1:
            return "[]"
            
        # Extract what seems to be JSON
        json_str = json_str[start_idx:end_idx+1]
        
        # Fix trailing commas before closing brackets
        json_str = re.sub(r',(\s*[\]}])', r'\1', json_str)
        
        # Ensure property names are properly double-quoted
        json_str = re.sub(r'(\w+)(?=\s*:)', r'"\1"', json_str)
        
        # Replace single quotes with double quotes
        json_str = json_str.replace("'", '"')
        
        # Fix any boolean or null values
        json_str = re.sub(r':\s*True', r': true', json_str)
        json_str = re.sub(r':\s*False', r': false', json_str)
        json_str = re.sub(r':\s*None', r': null', json_str)
        
        return json_str
    
    def format_alternative_for_display(self, alternative):
        """Format a product alternative for human-readable display"""
        product = alternative['product']
        improvement = alternative['improvement']
        
        output = [f"PRODUCT: {product.get('name', 'Unknown')}"]
        output.append(f"Price: ${product.get('price', 0):.2f}")
        
        # Add product URL if available
        if 'product_url' in alternative:
            url = alternative['product_url']
            # Make sure the URL is properly formatted
            if url.startswith(('http://', 'https://')):
                # Add clickable link format
                output.append(f"Link: {url}")
            else:
                # Fix URL if it doesn't have a protocol
                fixed_url = f"https://eco-store.example.com/products/{product.get('name', 'eco-product').lower().replace(' ', '-')}"
                output.append(f"Link: {fixed_url}")
        else:
            # Generate a default URL if none is provided
            default_url = f"https://eco-store.example.com/products/{product.get('name', 'eco-product').lower().replace(' ', '-')}"
            output.append(f"Link: {default_url}")
        
        if 'generated' in alternative and alternative['generated']:
            output.append("(AI-Generated Suggestion)")
        
        output.append(f"Sustainability Improvement: +{improvement:.1f} points")
        
        # Add sustainability tags if available
        metrics = product.get('sustainability_metrics', {})
        if isinstance(metrics, dict) and 'sustainability_tags' in metrics:
            tags = metrics['sustainability_tags']
            present_tags = [tag for tag, present in tags.items() if present]
            
            if present_tags:
                output.append("\nSustainability Tags:")
                for tag in present_tags:
                    output.append(f"✓ {tag}")
        
        # Add improvement reasons
        if 'improvement_reasons' in alternative and alternative['improvement_reasons']:
            output.append("\nKey Sustainability Improvements:")
            for reason in alternative['improvement_reasons']:
                output.append(f"✓ {reason}")
        
        # Add sustainability features for generated products
        if 'generated' in alternative and alternative['generated']:
            if 'sustainability_features' in metrics:
                output.append("\nSustainability Features:")
                for feature in metrics['sustainability_features']:
                    output.append(f"✓ {feature}")
        
        return "\n".join(output)
    
    def suggest_ingredient_alternatives(self, ingredients_list):
        """Suggest eco-friendly alternatives for ingredients or materials"""
        if not ingredients_list:
            return {}
        
        # Split the list into individual ingredients
        ingredients = [i.strip() for i in ingredients_list.split(',')]
        
        prompt = f"""
        You are a sustainability expert. Suggest eco-friendly alternatives for these materials/ingredients:
        
        {', '.join(ingredients)}
        
        For each material, provide 2-3 more sustainable alternatives with the following information:
        1. Name of the alternative
        2. Brief description of why it's more sustainable
        3. Environmental impact score (1-10, higher is better)
        
        Format as a JSON object with each original material as a key, and an array of alternatives as the value.
        Each alternative should have "name", "description", and "eco_score" fields.
        
        Example:
        {{
          "cotton": [
            {{
              "name": "Organic cotton",
              "description": "Grown without pesticides or synthetic fertilizers",
              "eco_score": 7
            }},
            {{
              "name": "Hemp",
              "description": "Requires less water and no pesticides",
              "eco_score": 8
            }}
          ]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            
            # Extract JSON from response
            try:
                alternatives = json.loads(self._clean_json_string(response.text))
                return alternatives
            except json.JSONDecodeError:
                # Fallback if parsing fails
                fallback = {}
                for ingredient in ingredients:
                    fallback[ingredient] = [
                        {
                            "name": f"Sustainable {ingredient}",
                            "description": "More environmentally friendly alternative with lower carbon footprint.",
                            "eco_score": 7
                        },
                        {
                            "name": f"Eco-friendly {ingredient} substitute",
                            "description": "Alternative that reduces resource consumption and pollution.",
                            "eco_score": 8
                        }
                    ]
                return fallback
                
        except Exception as e:
            print(f"Error suggesting alternatives: {e}")
            return {}