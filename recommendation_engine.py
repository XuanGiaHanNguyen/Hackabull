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
            
            # Extract product type from description
            product_type = self._extract_product_type(product_description)
            logger.debug(f"Extracted product type: {product_type}")
            
            # If we couldn't determine the product type, use the category or fallback to general
            if not product_type and category:
                product_type = category
            elif not product_type:
                product_type = "general"
                
            # Generate eco-friendly alternatives specific to the product type
            alternatives = self._generate_specific_alternatives(product_type, product_description)
            
            # If we have alternatives, return them
            if alternatives:
                return alternatives
                
            # If no products found, get generic eco alternatives for the category
            return self.generate_eco_alternatives_from_category(category or product_type or "general")
            
        except Exception as e:
            logger.error(f"Error finding alternatives: {str(e)}")
            return []
            
    def _extract_product_type(self, description):
        """Extract the product type from a description"""
        try:
            # Common product types that might be mentioned in descriptions
            product_keywords = {
                "clothing": ["shirt", "tshirt", "t-shirt", "pants", "jeans", "jacket", "hoodie", "sweater", "dress", "skirt", "socks", "underwear", "clothing", "apparel", "shoes", "sneakers", "boots", "footwear"],
                "electronics": ["phone", "smartphone", "laptop", "computer", "tablet", "headphones", "earbuds", "speaker", "television", "tv", "appliance", "electronic", "device", "power", "battery", "charger", "cable", "camera"],
                "food": ["food", "beverage", "drink", "snack", "meal", "grocery", "fruit", "vegetable", "meat", "dairy", "organic", "supplement"],
                "home": ["furniture", "chair", "table", "desk", "sofa", "couch", "bed", "mattress", "shelf", "lamp", "pillow", "blanket", "kitchenware", "utensil", "plate", "bowl", "cup", "mug", "towel", "rug", "curtain"],
                "beauty": ["soap", "shampoo", "conditioner", "lotion", "cream", "moisturizer", "makeup", "cosmetic", "deodorant", "toothpaste", "brush", "beauty", "skincare", "haircare"],
                "toys": ["toy", "game", "puzzle", "doll", "action figure", "board game", "bike", "bicycle", "scooter", "ball", "play"],
                "outdoor": ["tent", "backpack", "sleeping bag", "camping", "hiking", "fishing", "grill", "garden", "plant", "pot", "outdoor", "patio", "lawn", "canopy"]
            }
            
            # Convert description to lowercase for case-insensitive matching
            desc_lower = description.lower()
            
            # Check for direct matches of product type in the description
            for product_type, keywords in product_keywords.items():
                for keyword in keywords:
                    if keyword in desc_lower:
                        return product_type
            
            # If we couldn't determine the type, return None
            return None
        
        except Exception as e:
            logger.error(f"Error extracting product type: {str(e)}")
            return None
            
    def _generate_specific_alternatives(self, product_type, description):
        """Generate specific eco-friendly alternatives based on product type"""
        alternatives = []
        
        # Extract more specific product category
        specific_product = self._get_specific_product(product_type, description)
        logger.debug(f"Specific product identified: {specific_product}")
        
        # Create alternatives based on specific product eco-store data
        eco_alternatives = self._get_eco_friendly_products(product_type, specific_product)
        
        if eco_alternatives:
            for alt in eco_alternatives:
                alt_product = {
                    'name': alt['name'],
                    'description': alt['description'],
                    'price': alt['price'],
                    'url': alt['url']
                }
                
                alternatives.append({
                    'product': alt_product,
                    'improvement_reasons': alt['eco_features']
                })
        
        return alternatives
        
    def _get_specific_product(self, product_type, description):
        """Get more specific product name from the description"""
        try:
            # Common product sub-categories for each product type
            product_subtypes = {
                "clothing": {
                    "hoodie": ["hoodie", "sweatshirt", "pullover"],
                    "t-shirt": ["t-shirt", "tshirt", "tee", "shirt"],
                    "jeans": ["jeans", "denim", "pants", "trousers"],
                    "dress": ["dress", "gown"],
                    "shoes": ["shoes", "sneakers", "boots", "footwear"],
                    "jacket": ["jacket", "coat", "outerwear"],
                    "hat": ["hat", "cap", "beanie"]
                },
                "electronics": {
                    "smartphone": ["phone", "smartphone", "iphone", "android", "mobile"],
                    "laptop": ["laptop", "notebook", "computer"],
                    "headphones": ["headphones", "earbuds", "earphones", "headset"],
                    "tablet": ["tablet", "ipad"],
                    "tv": ["tv", "television", "monitor", "screen"],
                    "charger": ["charger", "power bank", "battery"],
                    "speaker": ["speaker", "sound system", "audio"],
                    "camera": ["camera", "webcam"]
                },
                "toys": {
                    "bicycle": ["bike", "bicycle", "tricycle", "cycle"],
                    "doll": ["doll", "action figure", "figure", "toy"],
                    "board game": ["board game", "puzzle", "game"],
                    "outdoor toy": ["outdoor", "playground"]
                },
                "home": {
                    "furniture": ["furniture", "chair", "table", "desk", "sofa", "couch", "bed", "shelf"],
                    "kitchenware": ["kitchenware", "utensil", "plate", "bowl", "cup", "mug", "knife", "dish", "pot", "pan"],
                    "decor": ["decor", "lamp", "pillow", "blanket", "frame", "artwork"],
                    "bedding": ["bedding", "sheets", "pillow", "duvet", "comforter", "mattress"]
                },
                "beauty": {
                    "skincare": ["skincare", "face", "cream", "moisturizer", "serum", "lotion"],
                    "hair care": ["hair", "shampoo", "conditioner"],
                    "makeup": ["makeup", "cosmetic", "lipstick", "mascara", "eyeshadow"],
                    "soap": ["soap", "body wash", "cleanser", "wash"]
                },
                "outdoor": {
                    "garden": ["garden", "plant", "pot", "flower", "soil"],
                    "camping": ["camping", "tent", "sleeping bag", "outdoor", "hiking"],
                    "patio": ["patio", "outdoor furniture", "umbrella", "grill", "bbq"]
                }
            }
            
            desc_lower = description.lower()
            
            # If we have a known product type, check for subtypes
            if product_type in product_subtypes:
                for subtype, keywords in product_subtypes[product_type].items():
                    for keyword in keywords:
                        if keyword in desc_lower:
                            return subtype
            
            # If no specific subtype found, return the general product type
            return product_type
            
        except Exception as e:
            logger.error(f"Error getting specific product: {str(e)}")
            return product_type
        
    def _get_eco_friendly_products(self, product_type, specific_product):
        """Get eco-friendly product data for a specific product type"""
        try:
            # Database of eco-friendly alternatives by product type
            eco_products_db = {
                "hoodie": [
                    {
                        "name": "Organic Cotton Fleece Hoodie",
                        "description": "Made with 100% GOTS certified organic cotton, dyed with non-toxic dyes, and produced in a fair trade certified factory.",
                        "price": 69.99,
                        "url": "https://earthhero.com/products/fashion/tentree-cooper-classic-hoodie-women/",
                        "eco_features": [
                            "Organic cotton reduces pesticide use",
                            "Fair trade certified manufacturing",
                            "Company plants 10 trees for every product sold"
                        ]
                    },
                    {
                        "name": "Recycled Polyester Blend Hoodie",
                        "description": "Made from post-consumer recycled plastic bottles converted into soft polyester fleece with low-impact dyes.",
                        "price": 58.00,
                        "url": "https://www.patagonia.com/product/mens-p-6-label-uprisal-hoody/39539.html",
                        "eco_features": [
                            "Made from recycled plastic bottles",
                            "Reduces virgin petroleum use",
                            "Bluesign certified for environmental production standards"
                        ]
                    },
                    {
                        "name": "Hemp-Cotton Blend Pullover Hoodie",
                        "description": "Sustainable hemp-organic cotton blend hoodie, requiring significantly less water to produce than conventional cotton.",
                        "price": 74.50,
                        "url": "https://wama.com/collections/hemp-clothing",
                        "eco_features": [
                            "Hemp requires minimal water and no pesticides",
                            "Biodegradable natural fibers",
                            "Carbon-neutral shipping"
                        ]
                    }
                ],
                "t-shirt": [
                    {
                        "name": "Organic Cotton Essential Tee",
                        "description": "Classic fit t-shirt made from 100% GOTS certified organic cotton, grown without synthetic pesticides or fertilizers.",
                        "price": 29.99,
                        "url": "https://www.pact.com/collections/men-tops",
                        "eco_features": [
                            "Organic farming practices",
                            "Fair trade certified factory",
                            "Carbon-offset shipping"
                        ]
                    },
                    {
                        "name": "Bamboo Lyocell T-Shirt",
                        "description": "Ultra-soft t-shirt made from sustainable bamboo lyocell that uses a closed-loop process to transform bamboo into silky fabric.",
                        "price": 34.50,
                        "url": "https://www.wearpact.com/women/apparel/tops%20&%20shirts",
                        "eco_features": [
                            "Bamboo grows quickly without pesticides",
                            "Closed-loop manufacturing process conserves water",
                            "Biodegradable fabric"
                        ]
                    },
                    {
                        "name": "Recycled Cotton Blend Tee",
                        "description": "Made from 60% recycled cotton from textile waste and 40% recycled polyester from plastic bottles.",
                        "price": 25.00,
                        "url": "https://www.threadbare.com/collections/organic-tshirts",
                        "eco_features": [
                            "Diverts textile waste from landfills",
                            "Low water manufacturing process",
                            "Reduces new resource consumption"
                        ]
                    }
                ],
                "bicycle": [
                    {
                        "name": "Eco-Friendly Bamboo Frame Bicycle",
                        "description": "Sustainable bamboo frame bicycle that's durable, lightweight, and has natural shock-absorbing properties.",
                        "price": 1899.00,
                        "url": "https://bamboobicycleclub.org/bamboo-bikes/",
                        "eco_features": [
                            "Renewable bamboo material",
                            "Lower carbon footprint than aluminum or steel frames",
                            "Biodegradable frame at end of life"
                        ]
                    },
                    {
                        "name": "Recycled Aluminum Children's Bicycle",
                        "description": "Kid's bike made from recycled aluminum with non-toxic paint and recyclable components. Made to grow with your child.",
                        "price": 349.99,
                        "url": "https://www.rei.com/product/153304/co-op-cycles-rev-20-kids-bike",
                        "eco_features": [
                            "Recycled aluminum frame reduces mining impact",
                            "Designed to be passed down as children grow",
                            "Recyclable at end of life"
                        ]
                    },
                    {
                        "name": "Eco Balance Bike for Toddlers",
                        "description": "Balance bike for young children made from FSC-certified sustainable wood with non-toxic finishes.",
                        "price": 129.00,
                        "url": "https://www.kinderkraft.com/products/uniq-natural",
                        "eco_features": [
                            "FSC-certified sustainable wood",
                            "Non-toxic, child-safe finishes",
                            "Biodegradable materials"
                        ]
                    }
                ],
                "electronics": [
                    {
                        "name": "Solar-Powered Portable Charger",
                        "description": "Solar panel power bank for charging phones and small devices, made with recycled plastic casing.",
                        "price": 49.99,
                        "url": "https://us.anker.com/collections/solar",
                        "eco_features": [
                            "Renewable solar energy",
                            "Recycled plastics in construction",
                            "Reduces reliance on grid electricity"
                        ]
                    },
                    {
                        "name": "Biodegradable Phone Case",
                        "description": "Fully compostable smartphone case made from plant-based materials that will break down naturally.",
                        "price": 35.00,
                        "url": "https://pela.earth/collections/pela-case",
                        "eco_features": [
                            "100% compostable and biodegradable",
                            "Made from plant-based biopolymers",
                            "Zero-waste packaging"
                        ]
                    },
                    {
                        "name": "Fairphone 4 Ethical Smartphone",
                        "description": "Modular smartphone designed for easy repair and upgrade, using fair trade minerals and ethical labor practices.",
                        "price": 599.00,
                        "url": "https://shop.fairphone.com/en/",
                        "eco_features": [
                            "Modular design for easy repair and longer life",
                            "Fair trade supply chain",
                            "Conflict-free minerals and metals"
                        ]
                    }
                ]
            }
            
            # Check for specific product first
            if specific_product in eco_products_db:
                return eco_products_db[specific_product]
            
            # Check for general product type
            if product_type in eco_products_db:
                return eco_products_db[product_type]
                
            # Fall back to empty list if no matches
            return []
            
        except Exception as e:
            logger.error(f"Error getting eco-friendly products: {str(e)}")
            return []

    def generate_eco_alternatives_from_category(self, category):
        """Generate eco-friendly products for a category"""
        try:
            # Generic eco-friendly alternatives with real URLs to eco-friendly websites
            eco_store_urls = {
                "clothing": "https://earthhero.com/collections/apparel/",
                "electronics": "https://earthhero.com/collections/technology/",
                "toys": "https://earthhero.com/collections/kids/",
                "home": "https://packagefreeshop.com/collections/home",
                "beauty": "https://packagefreeshop.com/collections/beauty",
                "food": "https://thrivemarket.com/c/pantry",
                "kitchen": "https://packagefreeshop.com/collections/kitchen",
                "pet": "https://earthhero.com/collections/pets/",
                "general": "https://earthhero.com/collections/all-products"
            }
            
            # Get a real URL for this category or fallback to general eco store
            store_url = eco_store_urls.get(category.lower(), eco_store_urls["general"])
            
            fallback_alternatives = [
                {
                    'product': {
                        'name': f"Eco-Friendly {category.title()} Collection",
                        'price': 24.99,
                        'description': f"Sustainable {category} made with recycled materials and eco-friendly manufacturing from EarthHero.",
                        'category': category,
                        'url': store_url
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
                        'name': f"Sustainable {category.title()} at Package Free Shop",
                        'price': 29.99,
                        'description': f"Premium sustainable {category} with zero-waste packaging and organic materials from Package Free Shop.",
                        'category': category,
                        'url': "https://packagefreeshop.com"
                    },
                    'improvement': 5,
                    'improvement_reasons': [
                        "Made with organic materials",
                        "Zero-waste company mission", 
                        "Plastic-free packaging"
                    ]
                },
                {
                    'product': {
                        'name': f"Eco-Friendly {category.title()} at Etsy",
                        'price': 19.99,
                        'description': f"Handmade eco-friendly {category} options from small sustainable businesses on Etsy.",
                        'category': category,
                        'url': f"https://www.etsy.com/search?q=sustainable+{category.lower()}"
                    },
                    'improvement': 3,
                    'improvement_reasons': [
                        "Supports small eco-conscious businesses",
                        "Handmade with care", 
                        "Unique sustainable designs"
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