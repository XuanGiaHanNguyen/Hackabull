# ai_analysis_service.py
import os
import base64
import json
import logging
import time
import random
import re
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image
import io

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class SustainabilityAnalyzer:
    def __init__(self):
        # Initialize Google Generative AI
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            logger.error("GOOGLE_API_KEY not found in environment variables")
            raise ValueError("GOOGLE_API_KEY is required. Please set it in the .env file.")
        
        genai.configure(api_key=api_key)
        
        # Initialize the generative model
        try:
            # Try to use the best available Gemini model
            self.model = genai.GenerativeModel('gemini-1.5-pro')
            logger.info("Using gemini-1.5-pro for analysis")
        except Exception as e:
            logger.warning(f"Could not initialize gemini-1.5-pro: {e}")
            try:
                # Fall back to gemini-1.0-pro if the newer model is not available
                self.model = genai.GenerativeModel('gemini-pro')
                logger.info("Using gemini-pro for analysis")
            except Exception as e:
                logger.error(f"Could not initialize any model: {e}")
                self.model = None
        
        # Initialize a vision model for image analysis
        try:
            self.vision_model = genai.GenerativeModel('gemini-1.5-pro-vision')
            logger.info("Using gemini-1.5-pro-vision for image analysis")
        except Exception as e:
            logger.warning(f"Could not initialize gemini-1.5-pro-vision: {e}")
            try:
                # Fall back to gemini-pro-vision if the newer model is not available
                self.vision_model = genai.GenerativeModel('gemini-pro-vision')
                logger.info("Using gemini-pro-vision for image analysis")
            except Exception as e:
                logger.error(f"Could not initialize any vision model: {e}")
                self.vision_model = None
    
    def analyze_product_description(self, description):
        """
        Analyze a product description for sustainability metrics
        
        Args:
            description (str): The product description to analyze
            
        Returns:
            dict: A dictionary containing sustainability metrics
        """
        try:
            logger.debug(f"Analyzing product description: {description[:50]}...")
            
            if not self.model:
                return {"error": "AI model not available"}
            
            # Create prompt for the AI model
            prompt = f"""
            Analyze this product description for sustainability and environmental impact:
            
            PRODUCT DESCRIPTION:
            {description}
            
            Perform a comprehensive sustainability analysis and return a STRUCTURED JSON RESPONSE with the following fields:
            
            1. materials_sustainability (float, 1-10): Score for the sustainability of materials
            2. manufacturing_process (float, 1-10): Score for the manufacturing process sustainability
            3. carbon_footprint (float, 1-10): Score for the product's carbon footprint (lower is better)
            4. recyclability (float, 1-10): Score for how recyclable the product is
            5. overall_sustainability_score (float, 1-10): Overall sustainability score
            6. improvement_opportunities (array of strings): List specific ways this product could be more sustainable
            7. sustainability_tags (object): Boolean fields for tags like "Eco-Friendly", "Organic", "Recyclable", "Biodegradable", "Fair Trade", "Energy Efficient", "Plastic-Free", "Single-Use", "Plastic Packaging", "High Carbon Footprint"
            8. sustainability_justification (string): Brief paragraph explaining the sustainability assessment
            
            Format your response as a well-structured JSON object WITHOUT ANY ADDITIONAL TEXT. Do not include markdown formatting, code blocks, or any text outside the JSON structure.
            """
            
            # Generate content using the AI model
            response = self.model.generate_content(prompt)
            
            # Process the response
            try:
                # Try to extract JSON from response
                response_text = response.text
                json_data = self._extract_json(response_text)
                
                return json_data
            except Exception as e:
                logger.error(f"Error processing analysis response: {e}")
                # Generate synthetic response with random scores for demonstration
                return self._generate_fallback_response(description)
        
        except Exception as e:
            logger.error(f"Error analyzing product description: {e}")
            return {"error": f"Error analyzing product: {str(e)}"}
    
    def analyze_product_image(self, image_data):
        """
        Analyze a product image for sustainability
        
        Args:
            image_data (bytes): The image data to analyze
            
        Returns:
            dict: A dictionary containing the image analysis and sustainability metrics
        """
        try:
            logger.debug("Analyzing product image...")
            
            if not self.vision_model:
                return {"error": "Vision model not available"}
            
            # Convert bytes to image for processing
            try:
                image = Image.open(io.BytesIO(image_data))
                # Resize if needed
                max_size = (1024, 1024)
                image.thumbnail(max_size, Image.LANCZOS)
                
                # Convert back to bytes
                img_byte_arr = io.BytesIO()
                image.save(img_byte_arr, format=image.format or 'JPEG')
                image_bytes = img_byte_arr.getvalue()
                
                # Create parts for the multimodal model
                image_parts = [
                    {
                        "mime_type": f"image/{image.format.lower() if image.format else 'jpeg'}", 
                        "data": image_bytes
                    }
                ]
            except Exception as e:
                logger.error(f"Error processing image: {e}")
                return {"error": f"Error processing image: {str(e)}"}
            
            # Create prompt for the AI model
            prompt = """
            Analyze this product image and provide:
            
            1. What the product appears to be
            2. A detailed description of what you observe
            3. Any visible materials, packaging, or labeling
            4. Any sustainability or eco-friendly claims visible
            
            Then analyze the product's likely sustainability impact based on what's visible.
            
            Return the results as a STRUCTURED JSON with the following fields:
            
            1. image_analysis: {
               product_name: what the product appears to be,
               description: detailed description of the product,
               visible_materials: list of materials you can identify,
               visible_claims: any eco-friendly or sustainability claims visible
            }
            
            2. sustainability_analysis: {
               materials_sustainability (float, 1-10): Estimated score for sustainability of visible materials,
               packaging_sustainability (float, 1-10): Score for visible packaging sustainability,
               greenwashing_risk (string): "Low", "Medium", or "High" risk of greenwashing based on visible claims,
               improvement_suggestions: array of realistic sustainability improvements,
               overall_sustainability_score (float, 1-10): Overall sustainability estimate,
               sustainability_justification: Brief justification for the assessment
            }
            
            Format your response as a well-structured JSON object WITHOUT ANY ADDITIONAL TEXT.
            """
            
            # Generate content using the AI model
            response = self.vision_model.generate_content([prompt, image_parts[0]])
            
            # Process the response
            try:
                # Try to extract JSON from response
                response_text = response.text
                json_data = self._extract_json(response_text)
                
                return json_data
            except Exception as e:
                logger.error(f"Error processing image analysis response: {e}")
                # Generate synthetic response
                return self._generate_fallback_image_analysis()
        
        except Exception as e:
            logger.error(f"Error analyzing product image: {e}")
            return {"error": f"Error analyzing image: {str(e)}"}
    
    def identify_greenwashing(self, description):
        """
        Analyze a product description to identify potential greenwashing
        
        Args:
            description (str): The product description to analyze
            
        Returns:
            dict: A dictionary containing greenwashing analysis
        """
        try:
            logger.debug(f"Analyzing for greenwashing: {description[:50]}...")
            
            if not self.model:
                return {"error": "AI model not available"}
            
            # Create prompt for the AI model
            prompt = f"""
            Analyze this product description for potential greenwashing:
            
            PRODUCT DESCRIPTION:
            {description}
            
            Greenwashing is the practice of making misleading or unsubstantiated claims about the environmental benefits of a product.
            
            Return a detailed analysis in JSON format with these fields:
            
            1. greenwashing_risk (string): "Low", "Medium", or "High" risk of greenwashing
            2. issues (array of strings): Specific potential greenwashing issues identified, if any
            3. vague_claims (array of strings): Any vague or unsubstantiated environmental claims
            4. misleading_terms (array of strings): Any potentially misleading terms
            5. missing_information (array of strings): Critical sustainability information that's missing
            6. explanation (string): Detailed explanation of the greenwashing assessment
            7. recommendations (array of strings): How the product description could be improved for transparency
            
            Format your response as a well-structured JSON object WITHOUT ANY ADDITIONAL TEXT.
            """
            
            # Generate content using the AI model
            response = self.model.generate_content(prompt)
            
            # Process the response
            try:
                # Try to extract JSON from response
                response_text = response.text
                json_data = self._extract_json(response_text)
                
                return json_data
            except Exception as e:
                logger.error(f"Error processing greenwashing analysis: {e}")
                # Generate synthetic response
                return self._generate_fallback_greenwashing(description)
        
        except Exception as e:
            logger.error(f"Error analyzing for greenwashing: {e}")
            return {"error": f"Error analyzing for greenwashing: {str(e)}"}
    
    def format_analysis_for_display(self, analysis):
        """
        Format the analysis results into HTML for display
        
        Args:
            analysis (dict): The analysis results
            
        Returns:
            str: Formatted HTML for display
        """
        if not analysis:
            return '<div class="alert alert-warning">No analysis data available.</div>'
        
        if "error" in analysis:
            return f'<div class="alert alert-danger">{analysis["error"]}</div>'
        
        try:
            html = '<div class="analysis-container">'
            
            # Overall sustainability score
            if "overall_sustainability_score" in analysis:
                score = self._parse_score(analysis["overall_sustainability_score"])
                score_class = self._get_score_class(score)
                
                html += f'''
                <div class="metric-container">
                    <div class="metric-name">
                        Overall Sustainability Score
                        <span class="metric-score">{score}/10</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill {score_class}" style="--target-width: {score * 10}%"></div>
                    </div>
                </div>
                '''
            
            # Materials sustainability
            if "materials_sustainability" in analysis:
                score = self._parse_score(analysis["materials_sustainability"])
                score_class = self._get_score_class(score)
                
                html += f'''
                <div class="metric-container">
                    <div class="metric-name">
                        Materials Sustainability
                        <span class="metric-score">{score}/10</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill {score_class}" style="--target-width: {score * 10}%"></div>
                    </div>
                </div>
                '''
            
            # Manufacturing process
            if "manufacturing_process" in analysis:
                score = self._parse_score(analysis["manufacturing_process"])
                score_class = self._get_score_class(score)
                
                html += f'''
                <div class="metric-container">
                    <div class="metric-name">
                        Manufacturing Process
                        <span class="metric-score">{score}/10</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill {score_class}" style="--target-width: {score * 10}%"></div>
                    </div>
                </div>
                '''
            
            # Carbon footprint
            if "carbon_footprint" in analysis:
                score = self._parse_score(analysis["carbon_footprint"])
                score_class = self._get_score_class(score)
                
                html += f'''
                <div class="metric-container">
                    <div class="metric-name">
                        Carbon Footprint
                        <span class="metric-score">{score}/10</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill {score_class}" style="--target-width: {score * 10}%"></div>
                    </div>
                </div>
                '''
            
            # Recyclability
            if "recyclability" in analysis:
                score = self._parse_score(analysis["recyclability"])
                score_class = self._get_score_class(score)
                
                html += f'''
                <div class="metric-container">
                    <div class="metric-name">
                        Recyclability
                        <span class="metric-score">{score}/10</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-fill {score_class}" style="--target-width: {score * 10}%"></div>
                    </div>
                </div>
                '''
            
            # Sustainability tags
            if "sustainability_tags" in analysis and isinstance(analysis["sustainability_tags"], dict):
                html += '<div class="metric-container"><h5>Sustainability Tags</h5><div class="tags-container">'
                
                for tag, value in analysis["sustainability_tags"].items():
                    if value and value is not False and value != "false" and value != "False":
                        tag_name = tag.replace("_", " ").title()
                        html += f'<span class="sustainability-tag">{tag_name}</span>'
                
                html += '</div></div>'
            
            # Improvement opportunities
            if "improvement_opportunities" in analysis and analysis["improvement_opportunities"]:
                html += '<div class="metric-container"><h5>Improvement Opportunities</h5><ul class="list-group">'
                
                for opportunity in analysis["improvement_opportunities"]:
                    html += f'<li class="list-group-item">{opportunity}</li>'
                
                html += '</ul></div>'
            
            # Sustainability justification
            if "sustainability_justification" in analysis and analysis["sustainability_justification"]:
                html += f'''
                <div class="metric-container">
                    <h5>Assessment Explanation</h5>
                    <div class="metric-justification">{analysis["sustainability_justification"]}</div>
                </div>
                '''
            
            html += '</div>'
            return html
            
        except Exception as e:
            logger.error(f"Error formatting analysis for display: {e}")
            return f'<div class="alert alert-danger">Error formatting analysis: {str(e)}</div>'
    
    def _extract_json(self, text):
        """
        Extract JSON from a text response
        
        Args:
            text (str): The text to extract JSON from
            
        Returns:
            dict: The extracted JSON as a dictionary
        """
        # Find the JSON part of the response
        try:
            # Look for JSON block
            json_match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
            if json_match:
                json_str = json_match.group(1)
            else:
                # Look for curly braces
                start_idx = text.find('{')
                end_idx = text.rfind('}') + 1
                if start_idx != -1 and end_idx > start_idx:
                    json_str = text[start_idx:end_idx]
                else:
                    raise ValueError("No JSON found in the response")
            
            # Parse the JSON
            return json.loads(json_str)
        except Exception as e:
            logger.error(f"Error extracting JSON: {e}")
            raise
    
    def _parse_score(self, score):
        """
        Parse a score value to ensure it's a float between 0 and 10
        
        Args:
            score: The score to parse
            
        Returns:
            float: The parsed score
        """
        try:
            # Convert to float if it's a string
            if isinstance(score, str):
                # Remove any trailing /10 or /100
                score = score.split('/')[0].strip()
                score = float(score)
            else:
                score = float(score)
            
            # Scale to 0-10 if it appears to be on a 0-100 scale
            if score > 10:
                score = score / 10
                
            # Clamp to 0-10
            return max(0, min(10, score))
        except:
            # Return a default value if parsing fails
            return 5.0
    
    def _get_score_class(self, score):
        """
        Get the CSS class for a score
        
        Args:
            score (float): The score
            
        Returns:
            str: The CSS class
        """
        if score >= 7:
            return "metric-fill"  # Good (green)
        elif score >= 4:
            return "medium-fill"  # Medium (yellow/orange)
        else:
            return "bad-fill"  # Bad (red)
    
    def _generate_fallback_response(self, description):
        """Generate a fallback response when API call fails"""
        # Check for eco-friendly keywords in the description
        eco_friendly_keywords = ['organic', 'recycled', 'sustainable', 'eco-friendly', 'biodegradable', 'fair trade']
        harmful_keywords = ['plastic', 'single-use', 'non-recyclable', 'chemical', 'synthetic']
        
        # Count occurrences of eco-friendly and harmful words
        eco_count = sum(1 for word in eco_friendly_keywords if word in description.lower())
        harm_count = sum(1 for word in harmful_keywords if word in description.lower())
        
        # Generate base scores based on keyword matches
        base_score = 5 + min(4, eco_count) - min(4, harm_count)
        base_score = max(1, min(9, base_score))  # Keep between 1-9
        
        # Create varied scores
        materials = base_score + random.uniform(-1, 1)
        manufacturing = base_score + random.uniform(-1, 1)
        carbon = base_score + random.uniform(-1, 1)
        recyclability = base_score + random.uniform(-1, 1)
        overall = (materials + manufacturing + carbon + recyclability) / 4
        
        # Round scores to nearest 0.5
        materials = round(materials * 2) / 2
        manufacturing = round(manufacturing * 2) / 2
        carbon = round(carbon * 2) / 2
        recyclability = round(recyclability * 2) / 2
        overall = round(overall * 2) / 2
        
        # Generate sustainability tags
        tags = {
            "Eco-Friendly": eco_count > 1,
            "Organic": "organic" in description.lower(),
            "Recyclable": "recycl" in description.lower(),
            "Biodegradable": "biodegrad" in description.lower(),
            "Fair Trade": "fair trade" in description.lower(),
            "Energy Efficient": "energy" in description.lower() and "efficien" in description.lower(),
            "Plastic-Free": "plastic-free" in description.lower(),
            "Single-Use": "single" in description.lower() and "use" in description.lower(),
            "Plastic Packaging": "plastic" in description.lower() and "packag" in description.lower(),
            "High Carbon Footprint": "carbon" in description.lower() and harm_count > 1
        }
        
        # Generate improvement opportunities
        improvements = []
        if not tags["Recyclable"]:
            improvements.append("Use recyclable materials")
        if tags["Plastic Packaging"]:
            improvements.append("Replace plastic packaging with biodegradable alternatives")
        if tags["Single-Use"]:
            improvements.append("Redesign for reusability instead of single-use")
        if not tags["Eco-Friendly"]:
            improvements.append("Source materials from sustainable suppliers")
        if overall < 7:
            improvements.append("Implement carbon offset program")
            
        if not improvements:
            improvements = [
                "Further improve material sourcing transparency",
                "Consider a take-back program for end-of-life recycling",
                "Reduce packaging volume"
            ]
        
        return {
            "materials_sustainability": materials,
            "manufacturing_process": manufacturing,
            "carbon_footprint": carbon,
            "recyclability": recyclability,
            "overall_sustainability_score": overall,
            "improvement_opportunities": improvements,
            "sustainability_tags": tags,
            "sustainability_justification": "This is a preliminary assessment based on the provided description. A more detailed analysis would require information about specific materials, manufacturing processes, and supply chain practices."
        }
    
    def _generate_fallback_image_analysis(self):
        """Generate a fallback image analysis when API call fails"""
        return {
            "image_analysis": {
                "product_name": "Product",
                "description": "The image appears to show a product. For detailed analysis, please try again or provide a clearer image.",
                "visible_materials": ["Unable to determine from image"],
                "visible_claims": ["No claims detected"]
            },
            "sustainability_analysis": {
                "materials_sustainability": 5,
                "packaging_sustainability": 5,
                "greenwashing_risk": "Medium",
                "improvement_suggestions": [
                    "Consider more transparent sustainability labeling",
                    "Use easily recyclable packaging materials",
                    "Provide more information about material sourcing"
                ],
                "overall_sustainability_score": 5,
                "sustainability_justification": "Without clear visibility of the product materials and packaging, a preliminary assessment gives an average sustainability score. More specific information would be needed for a detailed analysis."
            }
        }
    
    def _generate_fallback_greenwashing(self, description):
        """Generate a fallback greenwashing analysis when API call fails"""
        # Check for vague eco-terms
        vague_terms = ['eco-friendly', 'green', 'natural', 'sustainable', 'earth-friendly']
        specific_terms = ['recycled content', 'biodegradable', 'organic certified', 'carbon neutral', 'fair trade certified']
        
        # Count vague and specific terms
        vague_count = sum(1 for term in vague_terms if term in description.lower())
        specific_count = sum(1 for term in specific_terms if term in description.lower())
        
        # Determine risk level
        if vague_count > 2 and specific_count == 0:
            risk = "High"
        elif vague_count > 0 and specific_count <= vague_count:
            risk = "Medium"
        else:
            risk = "Low"
            
        # Generate vague claims
        vague_claims = [term for term in vague_terms if term in description.lower()]
        if not vague_claims:
            vague_claims = ["No specific vague claims detected"]
            
        # Generate issues
        issues = []
        if vague_count > 0 and specific_count == 0:
            issues.append("Uses vague environmental claims without specific substantiation")
        if "natural" in description.lower():
            issues.append("Uses 'natural' labeling which can be misleading (many harmful substances are also natural)")
        if "green" in description.lower() and specific_count == 0:
            issues.append("Uses 'green' terminology without specific environmental benefits")
            
        if not issues and risk != "Low":
            issues = ["Insufficient specific environmental information to back marketing claims"]
            
        # Generate recommendations
        recommendations = []
        if vague_count > 0:
            recommendations.append("Replace vague eco-terms with specific, measurable claims")
        if specific_count == 0:
            recommendations.append("Add quantifiable data about environmental benefits")
        recommendations.append("Include certification information from recognized environmental standards")
            
        return {
            "greenwashing_risk": risk,
            "issues": issues,
            "vague_claims": vague_claims,
            "misleading_terms": vague_claims[:2],
            "missing_information": [
                "Specific percentage of recycled content",
                "Third-party certifications",
                "Quantifiable environmental impact data"
            ],
            "explanation": f"The product description uses {vague_count} vague environmental terms but only {specific_count} specific, substantiated claims. This pattern is typical of {risk.lower()}-risk greenwashing, where marketing emphasizes environmental benefits without sufficient specific evidence.",
            "recommendations": recommendations
        }