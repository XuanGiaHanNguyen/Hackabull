# recommendation_engine.py
import json
import re
import random
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class EcoRecommendationEngine:
    def __init__(self):
        # Initialize the database
        self.product_database = []

    def add_product_to_database(self, product_info):
        """Add a product to the database with its sustainability analysis"""
        self.product_database.append(product_info)
        return len(self.product_database) - 1  # Return the index of the added product

    def find_alternatives(self, product_description, category=None, min_score=6):
        """Find eco-friendly alternatives to a given product"""
        try:
            logger.debug(f"Finding alternatives for: {product_description[:50]}...")
            
            # Filter products by category if specified
            if category:
                filtered_products = [p for p in self.product_database if p.get('category') == category]
            else:
                filtered_products = self.product_database
                
            # If no products in database, generate some
            if not filtered_products:
                return self.generate_eco_alternatives_from_category(category or "general")
                
            # Simple random selection for now as a fallback
            alternatives = []
            for product in random.sample(filtered_products, min(3, len(filtered_products))):
                alternatives.append({
                    'product': product,
                    'improvement': random.randint(2, 5),
                    'improvement_reasons': [
                        "Uses sustainable materials",
                        "Lower carbon footprint",
                        "Recyclable packaging"
                    ]
                })
                
            return alternatives
            
        except Exception as e:
            logger.error(f"Error finding alternatives: {str(e)}")
            return []

    def generate_eco_alternatives_from_category(self, category):
        """Generate eco-friendly products for a category"""
        try:
            # Fallback alternatives when no database matches
            fallback_alternatives = [
                {
                    'product': {
                        'name': f"Eco-Friendly {category.title()} Option 1",
                        'price': 24.99,
                        'description': f"Sustainable {category} made with recycled materials and eco-friendly manufacturing.",
                        'category': category,
                        'url': f"https://example.com/eco-{category}-1"
                    },
                    'improvement': 4,
                    'improvement_reasons': [
                        "Made with recycled materials",
                        "Eco-friendly manufacturing process", 
                        "Carbon-neutral shipping"
                    ]
                },
                {
                    'product': {
                        'name': f"Sustainable {category.title()} Alternative",
                        'price': 29.99,
                        'description': f"Premium sustainable {category} with organic materials and fair trade certification.",
                        'category': category,
                        'url': f"https://example.com/sustainable-{category}"
                    },
                    'improvement': 5,
                    'improvement_reasons': [
                        "Made with organic materials",
                        "Fair trade certified", 
                        "Zero waste packaging"
                    ]
                },
                {
                    'product': {
                        'name': f"Green {category.title()} Choice",
                        'price': 19.99,
                        'description': f"Affordable eco-friendly {category} option with biodegradable components.",
                        'category': category,
                        'url': f"https://example.com/green-{category}"
                    },
                    'improvement': 3,
                    'improvement_reasons': [
                        "Biodegradable components",
                        "Plastic-free packaging", 
                        "Low carbon footprint"
                    ]
                }
            ]
            
            return fallback_alternatives
            
        except Exception as e:
            logger.error(f"Error generating alternatives for category {category}: {str(e)}")
            return []

    def suggest_ingredient_alternatives(self, materials):
        """Suggest eco-friendly alternatives for materials or ingredients"""
        try:
            # Parse the materials string into a list
            material_list = [m.strip() for m in materials.split(',')]
            
            # Define some common sustainable alternatives
            alternatives = {}
            
            for material in material_list:
                if "plastic" in material.lower():
                    alternatives[material] = [
                        {
                            'name': 'Biodegradable plastic',
                            'benefits': 'Breaks down naturally, reducing landfill waste',
                            'considerations': 'May have shorter shelf life'
                        },
                        {
                            'name': 'Recycled plastic',
                            'benefits': 'Reduces virgin plastic consumption and waste',
                            'considerations': 'May have quality limitations'
                        },
                        {
                            'name': 'Bioplastics',
                            'benefits': 'Made from renewable resources instead of fossil fuels',
                            'considerations': 'Requires proper composting facilities'
                        }
                    ]
                elif "cotton" in material.lower():
                    alternatives[material] = [
                        {
                            'name': 'Organic cotton',
                            'benefits': 'Grown without synthetic pesticides or fertilizers',
                            'considerations': 'May be more expensive'
                        },
                        {
                            'name': 'Recycled cotton',
                            'benefits': 'Reduces water and energy use compared to virgin cotton',
                            'considerations': 'May have shorter fibers'
                        },
                        {
                            'name': 'Hemp',
                            'benefits': 'Requires less water and no pesticides',
                            'considerations': 'Different texture than cotton'
                        }
                    ]
                elif "polyester" in material.lower():
                    alternatives[material] = [
                        {
                            'name': 'Recycled polyester',
                            'benefits': 'Made from recycled plastic bottles',
                            'considerations': 'Still releases microplastics'
                        },
                        {
                            'name': 'Lyocell/Tencel',
                            'benefits': 'Biodegradable and made from sustainable wood pulp',
                            'considerations': 'Different properties than polyester'
                        }
                    ]
                else:
                    # Generic alternative for unknown materials
                    alternatives[material] = [
                        {
                            'name': f'Recycled {material}',
                            'benefits': 'Reduces waste and resource consumption',
                            'considerations': 'May require specialized suppliers'
                        },
                        {
                            'name': f'Sustainable {material} alternative',
                            'benefits': 'Lower environmental impact',
                            'considerations': 'May have different properties'
                        }
                    ]
            
            return alternatives
            
        except Exception as e:
            logger.error(f"Error finding material alternatives: {str(e)}")
            return {}

    def format_alternative_for_display(self, alternative):
        """Format a product alternative for display"""
        try:
            if not alternative or 'product' not in alternative:
                return ""
                
            product = alternative['product']
            name = product.get('name', 'Unknown Product')
            price = product.get('price', 0)
            description = product.get('description', '')
            url = product.get('url', '#')
            
            # Format the improvement reasons
            improvement_reasons = alternative.get('improvement_reasons', [])
            reasons_html = ""
            for reason in improvement_reasons:
                reasons_html += f'<div class="improvement-item">{reason}</div>'
                
            # Create the formatted HTML
            html = f"""
            <div class="product-card">
                <div class="product-name">{name}</div>
                <div class="product-price">${price:.2f}</div>
                <div class="product-description">{description}</div>
                
                <div class="improvements-container">
                    <h6>Sustainability Improvements:</h6>
                    {reasons_html}
                </div>
                
                <a href="{url}" class="product-link" target="_blank">View Product</a>
            </div>
            """
            
            return html
            
        except Exception as e:
            logger.error(f"Error formatting alternative: {str(e)}")
            return f"<div class=\"alert alert-danger\">Error formatting product: {str(e)}</div>"