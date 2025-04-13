# ai_analysis_service.py
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure API key
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Add this function to list available models
def list_available_models():
    """List all available models to help with debugging"""
    try:
        models = genai.list_models()
        print("Available models:")
        for model in models:
            print(f"- {model.name}")
        return models
    except Exception as e:
        print(f"Error listing models: {e}")
        return []
    

class SustainabilityAnalyzer:
    def __init__(self):
        # Try to find the correct model name
        try:
            models = list_available_models()
            # Look for newer Gemini models first
            preferred_models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash']
            
            # Try to find a preferred model
            model_found = False
            for preferred in preferred_models:
                for model in models:
                    if preferred in model.name.lower():
                        print(f"Selected model: {model.name}")
                        self.model = genai.GenerativeModel(model.name)
                        model_found = True
                        break
                if model_found:
                    break
            
            # If no preferred model was found, try any Gemini model that's not deprecated
            if not model_found:
                for model in models:
                    if "gemini" in model.name.lower() and "1.0" not in model.name.lower():
                        if "vision" in model.name.lower():
                            self.vision_model_name = model.name
                        else:
                            self.model = genai.GenerativeModel(model.name)
                            model_found = True
                            print(f"Using fallback model: {model.name}")
                            break
            
            # Last resort - try specific model names
            if not model_found:
                try:
                    self.model = genai.GenerativeModel('gemini-1.5-pro')
                except:
                    try:
                        self.model = genai.GenerativeModel('gemini-1.5-flash')
                    except:
                        print("Warning: Using last resort model. Functionality may be limited.")
                        self.model = genai.GenerativeModel('gemini-pro')
                
            # Don't initialize vision model here - will do it on demand in analyze_product_image
            self.vision_model = None
                        
        except Exception as e:
            print(f"Error initializing model: {e}")
            # Fall back to gemini-1.5-pro as a last resort
            try:
                self.model = genai.GenerativeModel('gemini-1.5-pro')
            except:
                print("Unable to initialize any model. The application may not function correctly.")
                self.model = None
            self.vision_model = None
        
        # Define sustainability tags
        self.sustainability_tags = [
            "Eco-Friendly",
            "Organic Material",
            "Recyclable Packaging",
            "Single-Use",
            "Plastic Packaging",
            "High Carbon Footprint"
        ]
    
    def analyze_product_description(self, product_description):
        """
        Analyze product description for sustainability indicators
        Returns a dictionary of sustainability metrics
        """
        prompt = f"""
        Analyze this product from a sustainability perspective:
        
        {product_description}
        
        Evaluate EACH of these metrics separately on a scale of 1-10:
        - Materials sustainability: Based on renewable/recycled content, resource depletion, toxicity
        - Manufacturing process: Energy usage, water consumption, pollution, worker conditions
        - Carbon footprint: Emissions throughout lifecycle including transportation
        - Recyclability: End-of-life recoverability, design for disassembly, circular potential
        
        IMPORTANT: Use the FULL RANGE from 1-10. Do not default to 5/10.
        - 1-3: Poor sustainability performance
        - 4-6: Average industry standard
        - 7-10: Leader in sustainability
        
        Provide specific justifications for each score. Base scores on known sustainability factors for this product category.
        Format response as a structured JSON object with these fields:
        - materials_sustainability (integer 1-10)
        - manufacturing_process (integer 1-10)
        - carbon_footprint (integer 1-10)
        - recyclability (integer 1-10)
        - overall_sustainability_score (integer 1-10)
        - detailed_justifications (object with justification for each metric)
        
        Example format:
        {{
          "materials_sustainability": 7,
          "manufacturing_process": 4,
          "carbon_footprint": 6,
          "recyclability": 8,
          "overall_sustainability_score": 6,
          "detailed_justifications": {{
            "materials": "Justification text...",
            "manufacturing": "Justification text...",
            "carbon_footprint": "Justification text...",
            "recyclability": "Justification text..."
          }}
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            
            # Process and structure the response
            analysis_result = self._process_response(response.text)
            
            # Add tag classification
            tags = self.classify_product_tags(product_description)
            analysis_result["sustainability_tags"] = tags
            
            return analysis_result
        except Exception as e:
            return {"error": str(e), "raw_response": response.text if hasattr(response, 'text') else "No response text"}
    
    def _process_response(self, response_text):
        """Process and structure the API response"""
        # In a real implementation, parse the JSON response
        try:
            # Try to parse as JSON if the model returned proper JSON
            # Clean up the response text to handle common JSON issues
            cleaned_text = self._clean_json_text(response_text)
            return json.loads(cleaned_text)
        except:
            # Otherwise return the text with basic structure
            return {
                "raw_analysis": response_text,
                "parsed": False,
                "materials_sustainability": 5,
                "manufacturing_process": 5,
                "carbon_footprint": 5,
                "recyclability": 5,
                "overall_sustainability_score": 5
            }
    
    def _clean_json_text(self, text):
        """Clean up JSON text to handle common issues"""
        # Find where JSON might begin (look for first '{')
        start_idx = text.find('{')
        if start_idx == -1:
            return "{}"
            
        # Find where JSON might end (look for last '}')
        end_idx = text.rfind('}')
        if end_idx == -1:
            return "{}"
            
        # Extract what seems to be JSON
        potential_json = text[start_idx:end_idx+1]
        
        # Fix common JSON errors
        # Replace single quotes with double quotes
        import re
        potential_json = re.sub(r"(?<!\\)'([^']*?)(?<!\\)'", r'"\1"', potential_json)
        
        # Make sure all keys are properly quoted
        potential_json = re.sub(r'([{,])\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', potential_json)
        
        return potential_json
    
    def classify_product_tags(self, product_description):
        """
        Classify product into predefined sustainability tags
        Returns a dictionary with tags and boolean values
        """
        tags_str = ", ".join(self.sustainability_tags)
        
        prompt = f"""
        Based on this product description:
        
        {product_description}
        
        Classify whether each of these sustainability tags applies (true) or not (false):
        {tags_str}
        
        For each tag, respond with 'true' ONLY if there is clear evidence in the description.
        Otherwise, respond with 'false'.
        
        Format your response as a clean JSON object with tag names as keys and boolean values.
        Example: {{"Eco-Friendly": true, "Organic Material": false, ...}}
        """
        
        try:
            response = self.model.generate_content(prompt)
            
            # Extract and process the tag classification
            cleaned_text = self._clean_json_text(response.text)
            tags_result = json.loads(cleaned_text)
            
            # Ensure all expected tags are present
            for tag in self.sustainability_tags:
                if tag not in tags_result:
                    tags_result[tag] = False
                    
            return tags_result
        except Exception as e:
            # If parsing fails, return a structure with all tags set to false
            default_tags = {tag: False for tag in self.sustainability_tags}
            return default_tags
    
    def identify_greenwashing(self, product_description):
        """Identify potential greenwashing in product descriptions"""
        prompt = f"""
        Analyze the following product description for potential greenwashing:
        
        {product_description}
        
        Identify any vague, misleading, or unsubstantiated environmental claims.
        Provide specific examples from the text and explain why they may be considered greenwashing.
        Rate the overall greenwashing risk on a scale of 1-10.
        Format response as a structured JSON object with these fields:
        - greenwashing_risk: numeric score from 1-10
        - issues: array of specific greenwashing issues identified
        - explanation: detailed explanation of findings
        """
        
        try:
            response = self.model.generate_content(prompt)
            return self._process_response(response.text)
        except Exception as e:
            return {
                "error": str(e),
                "greenwashing_risk": 5,
                "issues": ["Error processing greenwashing analysis"],
                "explanation": f"Could not complete analysis: {str(e)}"
            }
        
    def format_analysis_for_display(self, analysis_result):
        """Format analysis results for human-readable display"""
        if not analysis_result:
            return "Error in analysis: No analysis results available"
            
        if "error" in analysis_result:
            return f"Error in analysis: {analysis_result.get('error', 'Unknown error')}"
            
        output = ["SUSTAINABILITY ANALYSIS RESULTS", "=" * 30]
        
        # Add metrics section if available
        metrics = []
        for key, value in analysis_result.items():
            if key in ["materials_sustainability", "manufacturing_process", 
                      "carbon_footprint", "recyclability", "overall_sustainability_score"]:
                if isinstance(value, (int, float)):
                    metrics.append(f"{key.replace('_', ' ').title()}: {value}/10")
                elif isinstance(value, str):
                    try:
                        value_float = float(value)
                        metrics.append(f"{key.replace('_', ' ').title()}: {value_float}/10")
                    except ValueError:
                        metrics.append(f"{key.replace('_', ' ').title()}: {value}")
                    
        if metrics:
            output.append("\nSUSTAINABILITY METRICS")
            output.append("-" * 20)
            output.extend(metrics)
        
        # Add tag section
        if "sustainability_tags" in analysis_result:
            output.append("\nSUSTAINABILITY TAGS")
            output.append("-" * 20)
            tags = analysis_result["sustainability_tags"]
            present_tags = [tag for tag, present in tags.items() if present]
            
            if present_tags:
                output.append("Product has these tags:")
                for tag in present_tags:
                    output.append(f"✓ {tag}")
            else:
                output.append("No sustainability tags identified")
        
        # Add claims validation if available
        if "eco_friendly_claims" in analysis_result:
            output.append("\nECO-FRIENDLY CLAIMS")
            output.append("-" * 20)
            claims = analysis_result["eco_friendly_claims"]
            if isinstance(claims, list):
                for claim in claims:
                    output.append(f"- {claim}")
            else:
                output.append(str(claims))
        
        # Add greenwashing risk if available
        if "greenwashing_risk" in analysis_result:
            risk = analysis_result["greenwashing_risk"]
            if isinstance(risk, (int, float)):
                output.append(f"\nGreenwashing Risk: {risk}/10")
            else:
                output.append(f"\nGreenwashing Risk: {risk}")
                
        # Add raw analysis if parsed failed
        if analysis_result.get("parsed") is False and "raw_analysis" in analysis_result:
            output.append("\nRAW ANALYSIS (parsing failed)")
            output.append("-" * 20)
            output.append(analysis_result["raw_analysis"])
        
        return "\n".join(output)

    def analyze_product_image(self, image_file):
        """Fixed implementation for image analysis"""
        if not hasattr(self, 'vision_model') or self.vision_model is None:
            try:
                # Try using newer models first, as gemini-pro-vision is deprecated
                try:
                    # Try the recommended replacement model first
                    self.vision_model = genai.GenerativeModel('gemini-1.5-flash')
                    print("Using gemini-1.5-flash model")
                except:
                    try:
                        # Try other newer models
                        self.vision_model = genai.GenerativeModel('gemini-1.5-pro')
                        print("Using gemini-1.5-pro model")
                    except:
                        try:
                            # Try gemini-2.0 models
                            self.vision_model = genai.GenerativeModel('gemini-2.0-flash')
                            print("Using gemini-2.0-flash model")
                        except:
                            # Last resort - find any available model with vision capabilities
                            models = genai.list_models()
                            vision_model_name = None
                            
                            # Prioritize newer models over deprecated ones
                            for model_name in ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash']:
                                for model in models:
                                    if model_name in model.name.lower():
                                        vision_model_name = model.name
                                        print(f"Found model: {vision_model_name}")
                                        break
                                if vision_model_name:
                                    break
                            
                            # If still not found, try any vision model
                            if not vision_model_name:
                                for model in models:
                                    # Avoid deprecated models
                                    if "vision" in model.name.lower() and "1.0" not in model.name.lower():
                                        vision_model_name = model.name
                                        print(f"Using fallback model: {vision_model_name}")
                                        break
                            
                            if vision_model_name:
                                self.vision_model = genai.GenerativeModel(vision_model_name)
                            else:
                                return {"error": "No compatible vision models available. Please check your Gemini API access."}
            except Exception as e:
                return {"error": f"Could not initialize vision model: {str(e)}"}
        
        try:
            # Reset file cursor if it's been read previously
            if hasattr(image_file, 'seek'):
                image_file.seek(0)
            
            # Read image data properly
            if hasattr(image_file, 'read'):
                # If it's a file-like object (from web upload)
                image_bytes = image_file.read()
            else:
                # If it's a file path
                with open(image_file, 'rb') as f:
                    image_bytes = f.read()
            
            # Make sure we got some bytes
            if not image_bytes or len(image_bytes) < 100:
                return {"error": "Invalid image data. The uploaded file may be corrupted or empty."}
                
            print(f"Image size: {len(image_bytes)} bytes")
                
            # Create a prompt for better image analysis
            prompt = """
            Analyze this product image and provide:
            1. Product identification - what is this specific product?
            2. Material composition assessment 
            3. Sustainability evaluation including:
               - Materials used and their environmental impact
               - Potential manufacturing process
               - Recyclability score (1-10)
               - Overall environmental impact score (1-10)
            
            Be specific about sustainability aspects and potential improvements.
            """
            
            # Process with Gemini Vision - make sure the prompt is first and image data is the second parameter
            generation_config = {
                "temperature": 0.4,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 1024,
            }
            
            # Create the parts list with the prompt as text and the image data
            parts = [
                {"text": prompt},
                {"inline_data": {"mime_type": "image/jpeg", "data": image_bytes}}
            ]
            
            response = self.vision_model.generate_content(parts, generation_config=generation_config)
            
            # Extract product name and details from response
            response_text = response.text
            lines = response_text.split('\n')
            product_name = lines[0] if lines else "Unknown product"
            
            # Use the response to create a detailed product description
            product_description = response_text
            
            # Run standard sustainability analysis on this description
            sustainability_analysis = self.analyze_product_description(product_description)
            
            return {
                "image_analysis": {
                    "product_name": product_name,
                    "description": product_description
                },
                "sustainability_analysis": sustainability_analysis
            }
        except Exception as e:
            error_message = str(e)
            print(f"Image analysis error: {error_message}")
            return {
                "error": f"Image analysis failed: {error_message}",
                "details": "The image analysis feature requires a properly formatted image file and a working connection to the Gemini API."
            }
            
    def format_image_analysis_for_display(self, analysis_result):
        """Format image analysis results for human-readable display"""
        if "error" in analysis_result:
            return f"Error in image analysis: {analysis_result['error']}"
            
        output = ["PRODUCT IMAGE ANALYSIS", "=" * 30]
        
        # Add image analysis results
        if "image_analysis" in analysis_result:
            image_data = analysis_result["image_analysis"]
            output.append(f"\nIdentified Product: {image_data.get('product_name', 'Unknown')}")
            
            if "description" in image_data:
                output.append(f"\nDescription: {image_data['description']}")
                
            if "visible_materials" in image_data:
                output.append("\nVisible Materials:")
                if isinstance(image_data["visible_materials"], list):
                    for material in image_data["visible_materials"]:
                        output.append(f"- {material}")
                else:
                    output.append(f"- {image_data['visible_materials']}")
                    
            if "eco_claims" in image_data:
                output.append("\nEco-Friendly Claims/Labels:")
                if isinstance(image_data["eco_claims"], list):
                    for claim in image_data["eco_claims"]:
                        output.append(f"- {claim}")
                else:
                    output.append(f"- {image_data['eco_claims']}")
                    
            if "potential_sustainability_issues" in image_data:
                output.append("\nPotential Sustainability Issues:")
                if isinstance(image_data["potential_sustainability_issues"], list):
                    for issue in image_data["potential_sustainability_issues"]:
                        output.append(f"- {issue}")
                else:
                    output.append(f"- {image_data['potential_sustainability_issues']}")
        
        # Add sustainability analysis if available
        if "sustainability_analysis" in analysis_result:
            output.append("\n" + self.format_analysis_for_display(analysis_result["sustainability_analysis"]))
            
        return "\n".join(output)