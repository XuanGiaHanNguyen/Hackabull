$(document).ready(function() {
    // Load categories on page load
    loadCategories();

    // Product Analysis Form Submit
    $('#analyze-form').submit(function(e) {
        e.preventDefault();
        const description = $('#product-description').val();
        const category = $('#product-category').val();

        // Show loading spinner
        $('#analysis-content').html('<div class="spinner-container"><div class="spinner"></div><p>Analyzing product...</p></div>');
        $('#analysis-results').show();
        
        // Hide other result containers
        $('#greenwashing-results').hide();
        $('#alternatives-results').hide();
        
        // Analyze the product
        $.ajax({
            url: '/analyze',
            method: 'POST',
            data: {
                description: description,
                category: category
            },
            success: function(response) {
                // Display formatted analysis
                if (response.analysis && response.analysis.error) {
                    $('#analysis-content').html(`<div class="alert alert-danger">${response.analysis.error}</div>`);
                } else {
                    $('#analysis-content').html(formatAnalysisObject(response.analysis));
                }
                
                // Scroll to results
                $('html, body').animate({
                    scrollTop: $('#analysis-results').offset().top - 70
                }, 500);
            },
            error: function() {
                $('#analysis-content').html('<div class="alert alert-danger">Error analyzing product. Please try again.</div>');
            }
        });
    });
    
    // Find Alternatives Button Click
    $('#find-alternatives-btn').click(function() {
        const description = $('#product-description').val();
        const category = $('#product-category').val();
        
        if (!description) {
            alert('Please enter a product description first.');
            return;
        }
        
        // Show loading spinner
        $('#alternatives-content').html('<div class="spinner-container"><div class="spinner"></div><p>Finding eco-friendly alternatives...</p></div>');
        $('#alternatives-results').show();
        
        // Find alternatives
        $.ajax({
            url: '/alternatives',
            method: 'POST',
            data: {
                description: description,
                category: category
            },
            success: function(response) {
                if (response.alternatives && response.alternatives.length > 0) {
                    displayAlternatives(response.alternatives);
                } else {
                    $('#alternatives-content').html('<div class="alert alert-warning">No specific alternatives found. Please try a different product description or category.</div>');
                }
                
                // Scroll to results
                $('html, body').animate({
                    scrollTop: $('#alternatives-results').offset().top - 70
                }, 500);
            },
            error: function() {
                $('#alternatives-content').html('<div class="alert alert-danger">Error finding alternatives. Please try again.</div>');
            }
        });
    });
    
    // Check Greenwashing Button Click
    $('#check-greenwashing-btn').click(function() {
        const description = $('#product-description').val();
        
        if (!description) {
            alert('Please enter a product description first.');
            return;
        }
        
        // Show loading spinner
        $('#greenwashing-content').html('<div class="spinner-container"><div class="spinner"></div><p>Analyzing for greenwashing...</p></div>');
        $('#greenwashing-results').show();
        
        // Check for greenwashing
        $.ajax({
            url: '/greenwashing',
            method: 'POST',
            data: {
                description: description
            },
            success: function(response) {
                displayGreenwashing(response.greenwashing);
                
                // Scroll to results
                $('html, body').animate({
                    scrollTop: $('#greenwashing-results').offset().top - 70
                }, 500);
            },
            error: function() {
                $('#greenwashing-content').html('<div class="alert alert-danger">Error checking greenwashing. Please try again.</div>');
            }
        });
    });
    
    // Image Analysis Form Submit
    $('#image-analysis-form').submit(function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        const imageFile = $('#product-image')[0].files[0];
        
        if (!imageFile) {
            alert('Please select an image to analyze.');
            return;
        }
        
        formData.append('image', imageFile);
        
        // Show loading spinner
        $('#image-analysis-content').html('<div class="spinner-container"><div class="spinner"></div><p>Analyzing image...</p></div>');
        $('#image-analysis-results').show();
        
        // Analyze image
        $.ajax({
            url: '/upload_image',
            method: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                if (response.error) {
                    $('#image-analysis-content').html(`<div class="alert alert-danger">${response.error}</div>`);
                    if (response.details) {
                        $('#image-analysis-content').append(`<div class="alert alert-info">${response.details}</div>`);
                    }
                } else {
                    // Display formatted analysis
                    let html = '<div class="analysis-container">';
                    
                    // Add image analysis
                    if (response.analysis && response.analysis.image_analysis) {
                        const imageAnalysis = response.analysis.image_analysis;
                        html += `
                            <div class="mb-4">
                                <h4 class="analysis-header">Product Identification</h4>
                                <div><strong>Product:</strong> ${imageAnalysis.product_name || 'Unknown'}</div>
                                <div class="mt-2"><strong>Description:</strong></div>
                                <div class="metric-justification">${imageAnalysis.description}</div>
                            </div>
                        `;
                    }
                    
                    // Add sustainability analysis
                    if (response.analysis && response.analysis.sustainability_analysis) {
                        html += formatAnalysisObject(response.analysis.sustainability_analysis);
                    }
                    
                    html += '</div>';
                    $('#image-analysis-content').html(html);
                }
                
                // Scroll to results
                $('html, body').animate({
                    scrollTop: $('#image-analysis-results').offset().top - 70
                }, 500);
            },
            error: function() {
                $('#image-analysis-content').html('<div class="alert alert-danger">Error analyzing image. Please try again.</div>');
            }
        });
    });
    
    // Materials Form Submit
    $('#materials-form').submit(function(e) {
        e.preventDefault();
        
        const materials = $('#materials-list').val();
        
        if (!materials) {
            alert('Please enter materials or ingredients.');
            return;
        }
        
        // Show loading spinner
        $('#materials-content').html('<div class="spinner-container"><div class="spinner"></div><p>Finding sustainable alternatives...</p></div>');
        $('#materials-results').show();
        
        // Find material alternatives
        $.ajax({
            url: '/material_alternatives',
            method: 'POST',
            data: {
                materials: materials
            },
            success: function(response) {
                displayMaterialAlternatives(response.alternatives);
                
                // Scroll to results
                $('html, body').animate({
                    scrollTop: $('#materials-results').offset().top - 70
                }, 500);
            },
            error: function() {
                $('#materials-content').html('<div class="alert alert-danger">Error finding alternatives. Please try again.</div>');
            }
        });
    });
    
    // Format analysis from a JSON object
    function formatAnalysisObject(analysis) {
        if (!analysis) {
            return '<div class="alert alert-warning">No analysis data available.</div>';
        }
        
        if (analysis.error) {
            return `<div class="alert alert-danger">${analysis.error}</div>`;
        }
        
        // Ultra-concise format (new format)
        if (analysis.type === 'concise_analysis') {
            let html = '<div class="ultra-concise-analysis">';
            
            // Title with product name
            html += `<h4 class="concise-title">${analysis.title}</h4>`;
            
            // Material info
            html += `<p class="concise-materials">${analysis.materials}</p>`;
            
            // Impact section
            html += '<p class="concise-section-title">Impact:</p>';
            html += '<div class="concise-impact-list">';
            analysis.impact_points.forEach(point => {
                html += `<p>${point}</p>`;
            });
            html += '</div>';
            
            // Recyclability & Impact scores
            html += `<p class="concise-score">${analysis.recyclability}</p>`;
            html += `<p class="concise-score">${analysis.overall_impact}</p>`;
            
            html += '</div>';
            return html;
        }
        
        // Handle legacy array format 
        if (Array.isArray(analysis)) {
            let html = '<div class="analysis-container concise-container">';
            
            // Process each section in the analysis array
            analysis.forEach(section => {
                switch(section.type) {
                    case 'summary':
                        html += `<div class="summary-box">
                            <h5 class="summary-title">Summary</h5>
                            <p>${section.content}</p>
                        </div>`;
                        break;
                        
                    case 'metrics':
                        html += '<div class="metrics-container">';
                        section.content.forEach(metric => {
                            html += createMetricBar(metric.name, metric.score);
                        });
                        html += '</div>';
                        break;
                        
                    case 'recommendation':
                        html += `<div class="recommendation-box">
                            <h5><i class="fas fa-lightbulb text-warning"></i> Recommendation</h5>
                            <p>${section.content}</p>
                        </div>`;
                        break;
                    
                    case 'product_info':
                        html += `<div class="product-info-box">
                            <h4 class="product-info-title">Product Identification</h4>
                            <div class="product-name-label">Product: <span class="product-name-value">${section.content.name}</span></div>
                            <div class="product-description-label mt-2">Description:</div>
                            <div class="product-description-value">${section.content.description}</div>
                        </div>`;
                        break;
                        
                    default:
                        html += `<div>${JSON.stringify(section.content)}</div>`;
                }
            });
            
            html += '</div>';
            return html;
        }
        
        // Original detailed format handling (fallback)
        let html = '<div class="analysis-container">';
        html += '<h4 class="analysis-header">SUSTAINABILITY ANALYSIS RESULTS</h4>';
        
        // Format metrics section
        html += '<div class="mt-4 mb-4"><h5>SUSTAINABILITY METRICS</h5></div>';
        
        // Materials sustainability
        if ('materials_sustainability' in analysis) {
            let score = parseScore(analysis.materials_sustainability);
            let scoreClass = getScoreClass(score);
            
            html += `
            <div class="metric-container">
                <div class="metric-name">
                    Materials Sustainability
                    <span class="metric-score">${score}/10</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-fill ${scoreClass}" style="--target-width: ${score * 10}%"></div>
                </div>
            </div>
            `;
        }
        
        // Manufacturing process
        if ('manufacturing_process' in analysis) {
            let score = parseScore(analysis.manufacturing_process);
            let scoreClass = getScoreClass(score);
            
            html += `
            <div class="metric-container">
                <div class="metric-name">
                    Manufacturing Process
                    <span class="metric-score">${score}/10</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-fill ${scoreClass}" style="--target-width: ${score * 10}%"></div>
                </div>
            </div>
            `;
        }
        
        // Carbon footprint
        if ('carbon_footprint' in analysis) {
            let score = parseScore(analysis.carbon_footprint);
            let scoreClass = getScoreClass(score);
            
            html += `
            <div class="metric-container">
                <div class="metric-name">
                    Carbon Footprint
                    <span class="metric-score">${score}/10</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-fill ${scoreClass}" style="--target-width: ${score * 10}%"></div>
                </div>
            </div>
            `;
        }
        
        // Recyclability
        if ('recyclability' in analysis) {
            let score = parseScore(analysis.recyclability);
            let scoreClass = getScoreClass(score);
            
            html += `
            <div class="metric-container">
                <div class="metric-name">
                    Recyclability
                    <span class="metric-score">${score}/10</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-fill ${scoreClass}" style="--target-width: ${score * 10}%"></div>
                </div>
            </div>
            `;
        }
        
        // Overall sustainability score
        if ('overall_sustainability_score' in analysis) {
            let score = parseScore(analysis.overall_sustainability_score);
            let scoreClass = getScoreClass(score);
            
            html += `
            <div class="metric-container">
                <div class="metric-name">
                    Overall Sustainability Score
                    <span class="metric-score">${score}/10</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-fill ${scoreClass}" style="--target-width: ${score * 10}%"></div>
                </div>
            </div>
            `;
        }
        
        // Sustainability tags
        if ('sustainability_tags' in analysis && typeof analysis.sustainability_tags === 'object') {
            html += '<div class="metric-container"><h5>Sustainability Tags</h5><div class="tags-container">';
            
            for (const [tag, value] of Object.entries(analysis.sustainability_tags)) {
                if (value && value !== false && value !== "false" && value !== "False") {
                    const tagName = tag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    html += `<span class="sustainability-tag">${tagName}</span>`;
                }
            }
            
            html += '</div></div>';
        }
        
        // Improvement opportunities
        if ('improvement_opportunities' in analysis && analysis.improvement_opportunities.length > 0) {
            html += '<div class="metric-container"><h5>Improvement Opportunities</h5><ul class="list-group">';
            
            analysis.improvement_opportunities.forEach(opportunity => {
                html += `<li class="list-group-item">${opportunity}</li>`;
            });
            
            html += '</ul></div>';
        }
        
        // Sustainability justification
        if ('sustainability_justification' in analysis && analysis.sustainability_justification) {
            html += `
            <div class="metric-container">
                <h5>Sustainability Assessment</h5>
                <div class="metric-justification">${analysis.sustainability_justification}</div>
            </div>
            `;
        }
        
        html += '</div>';
        return html;
    }
    
    // Display alternatives
    function displayAlternatives(alternatives) {
        if (!alternatives || alternatives.length === 0) {
            $('#alternatives-content').html('<div class="alert alert-warning">No eco-friendly alternatives found.</div>');
            return;
        }
        
        let html = '';
        
        alternatives.forEach((alt, index) => {
            const product = alt.product;
            const isGenerated = alt.generated || false;
            
            // Create product card
            html += `
            <div class="col-md-6 mb-4">
                <div class="product-card">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">$${product.price.toFixed(2)}</div>
                    <div class="product-description">${product.description}</div>
                    
                    <div class="improvements-container">
                        <div><strong>Sustainability Improvements:</strong></div>
            `;
            
            // Add improvement reasons
            if (alt.improvement_reasons && alt.improvement_reasons.length > 0) {
                alt.improvement_reasons.forEach(reason => {
                    html += `<div class="improvement-item">${reason}</div>`;
                });
            } else {
                html += `<div class="improvement-item">Overall better sustainability score</div>`;
            }
            
            html += `
                    </div>
                    
                    <div class="mt-3">
                        <div><strong>Overall Score:</strong></div>
                        <div class="score-indicator">
                            <div class="score-fill score-good" style="width: ${(parseScore(product.sustainability_metrics.overall_sustainability_score) * 10)}%"></div>
                        </div>
                        <span class="score-text">${parseScore(product.sustainability_metrics.overall_sustainability_score)}/10</span>
                    </div>
            `;
            
            // Add source indication for generated products
            if (isGenerated) {
                html += `<div class="mt-2"><small class="text-muted">AI-suggested alternative</small></div>`;
            }
            
            // Close the card
            html += `
                    <div class="mt-3">
                        <a href="#" class="product-link btn-block">View Product Details</a>
                    </div>
                </div>
            </div>
            `;
        });
        
        $('#alternatives-content').html(html);
    }
    
    // Display greenwashing analysis
    function displayGreenwashing(analysis) {
        if (!analysis) {
            $('#greenwashing-content').html('<div class="alert alert-warning">No greenwashing analysis available.</div>');
            return;
        }
        
        if (analysis.error) {
            $('#greenwashing-content').html(`<div class="alert alert-danger">${analysis.error}</div>`);
            return;
        }
        
        let html = `
        <div class="analysis-container">
            <div class="mb-4">
                <h4>Greenwashing Risk Assessment</h4>
        `;
        
        // Display risk level with appropriate color
        let riskColor = 'success';
        if (analysis.greenwashing_risk === 'Medium') {
            riskColor = 'warning';
        } else if (analysis.greenwashing_risk === 'High') {
            riskColor = 'danger';
        }
        
        html += `
                <div class="alert alert-${riskColor}">
                    <strong>Risk Level: ${analysis.greenwashing_risk || 'Unknown'}</strong>
                </div>
            </div>
        `;
        
        // Display explanation
        if (analysis.explanation) {
            html += `
            <div class="metric-container">
                <h5>Analysis</h5>
                <div class="metric-justification">${analysis.explanation}</div>
            </div>
            `;
        }
        
        // Display issues if any
        if (analysis.issues && analysis.issues.length > 0) {
            html += `
            <div class="metric-container">
                <h5>Potential Issues</h5>
                <ul class="list-group">
            `;
            
            analysis.issues.forEach(issue => {
                html += `<li class="list-group-item list-group-item-warning">${issue}</li>`;
            });
            
            html += `
                </ul>
            </div>
            `;
        }
        
        // Display vague claims if any
        if (analysis.vague_claims && analysis.vague_claims.length > 0) {
            html += `
            <div class="metric-container">
                <h5>Vague or Unsubstantiated Claims</h5>
                <ul class="list-group">
            `;
            
            analysis.vague_claims.forEach(claim => {
                html += `<li class="list-group-item list-group-item-warning">${claim}</li>`;
            });
            
            html += `
                </ul>
            </div>
            `;
        }
        
        // Display misleading terms if any
        if (analysis.misleading_terms && analysis.misleading_terms.length > 0) {
            html += `
            <div class="metric-container">
                <h5>Potentially Misleading Terms</h5>
                <ul class="list-group">
            `;
            
            analysis.misleading_terms.forEach(term => {
                html += `<li class="list-group-item list-group-item-warning">${term}</li>`;
            });
            
            html += `
                </ul>
            </div>
            `;
        }
        
        // Display missing information if any
        if (analysis.missing_information && analysis.missing_information.length > 0) {
            html += `
            <div class="metric-container">
                <h5>Missing Information</h5>
                <ul class="list-group">
            `;
            
            analysis.missing_information.forEach(info => {
                html += `<li class="list-group-item list-group-item-info">${info}</li>`;
            });
            
            html += `
                </ul>
            </div>
            `;
        }
        
        // Display recommendations if any
        if (analysis.recommendations && analysis.recommendations.length > 0) {
            html += `
            <div class="metric-container">
                <h5>Recommendations for Improvement</h5>
                <ul class="list-group">
            `;
            
            analysis.recommendations.forEach(rec => {
                html += `<li class="list-group-item list-group-item-success">${rec}</li>`;
            });
            
            html += `
                </ul>
            </div>
            `;
        }
        
        html += '</div>';
        $('#greenwashing-content').html(html);
    }
    
    // Display material alternatives
    function displayMaterialAlternatives(alternatives) {
        if (!alternatives || Object.keys(alternatives).length === 0) {
            $('#materials-content').html('<div class="alert alert-warning">No sustainable alternatives found for the specified materials.</div>');
            return;
        }
        
        let html = '';
        
        for (const [material, alts] of Object.entries(alternatives)) {
            html += `
            <div class="material-alternative">
                <h4 class="material-name">${material}</h4>
            `;
            
            if (alts && alts.length > 0) {
                alts.forEach(alt => {
                    html += `
                    <div class="alternative-item">
                        <div class="alternative-name">${alt.name || 'Unknown Alternative'}</div>
                        
                        <div class="mt-2"><strong>Benefits:</strong></div>
                        <div class="benefits-list">${alt.benefits || 'No specific benefits listed'}</div>
                        
                        ${alt.considerations ? 
                            `<div class="mt-2"><strong>Considerations:</strong></div>
                            <div class="considerations-list">${alt.considerations}</div>` : ''}
                    </div>
                    `;
                });
            } else {
                html += '<div class="alert alert-warning">No specific alternatives found for this material.</div>';
            }
            
            html += '</div>';
        }
        
        $('#materials-content').html(html);
    }
    
    // Load categories
    function loadCategories() {
        $.ajax({
            url: '/categories',
            method: 'GET',
            success: function(response) {
                if (response.categories && response.categories.length > 0) {
                    let html = '';
                    
                    response.categories.forEach(category => {
                        html += `
                        <div class="col-md-4 col-sm-6 mb-3">
                            <button class="category-btn btn-block w-100" data-category="${category.id}">
                                <i class="fas fa-${category.icon || 'tag'} me-2"></i>${category.name}
                            </button>
                        </div>
                        `;
                    });
                    
                    $('#categories-list').html(html);
                    
                    // Add click handlers for category buttons
                    $('.category-btn').click(function() {
                        const categoryId = $(this).data('category');
                        const categoryName = $(this).text().trim();
                        
                        // Show loading
                        $('#category-content').html('<div class="spinner-container"><div class="spinner"></div><p>Loading eco-friendly products...</p></div>');
                        $('#category-title').html(`<i class="fas fa-list me-2"></i>${categoryName} - Eco-Friendly Options`);
                        $('#category-results').show();
                        
                        // Fetch category products
                        $.ajax({
                            url: `/category_products/${categoryId}`,
                            method: 'GET',
                            success: function(response) {
                                if (response.products && response.products.length > 0) {
                                    let html = '';
                                    
                                    response.products.forEach(product => {
                                        html += `
                                        <div class="col-md-6 mb-4">
                                            <div class="product-card">
                                                <div class="product-name">${product.product.name}</div>
                                                <div class="product-price">$${product.product.price.toFixed(2)}</div>
                                                <div class="product-description">${product.product.description}</div>
                                                
                                                <div class="mt-3">
                                                    <div><strong>Sustainability Score:</strong></div>
                                                    <div class="score-indicator">
                                                        <div class="score-fill score-good" style="width: ${(parseScore(product.product.sustainability_metrics.overall_sustainability_score) * 10)}%"></div>
                                                    </div>
                                                    <span class="score-text">${parseScore(product.product.sustainability_metrics.overall_sustainability_score)}/10</span>
                                                </div>
                                                
                                                <div class="mt-3">
                                                    <a href="#" class="product-link btn-block">View Product Details</a>
                                                </div>
                                            </div>
                                        </div>
                                        `;
                                    });
                                    
                                    $('#category-content').html(html);
                                } else {
                                    $('#category-content').html('<div class="alert alert-warning">No eco-friendly products found in this category.</div>');
                                }
                                
                                // Scroll to results
                                $('html, body').animate({
                                    scrollTop: $('#category-results').offset().top - 70
                                }, 500);
                            },
                            error: function() {
                                $('#category-content').html('<div class="alert alert-danger">Error loading category products. Please try again.</div>');
                            }
                        });
                    });
                } else {
                    $('#categories-list').html('<div class="alert alert-warning">No product categories available.</div>');
                }
            },
            error: function() {
                $('#categories-list').html('<div class="alert alert-danger">Error loading categories. Please refresh the page to try again.</div>');
            }
        });
    }
    
    // Helper function: Create a metric bar
    function createMetricBar(name, score) {
        const parsedScore = parseScore(score);
        const scoreClass = getScoreClass(parsedScore);
        
        return `
        <div class="metric-container">
            <div class="metric-name">
                ${name}
                <span class="metric-score">${parsedScore}/10</span>
            </div>
            <div class="metric-bar">
                <div class="metric-fill ${scoreClass}" style="--target-width: ${parsedScore * 10}%"></div>
            </div>
        </div>
        `;
    }
    
    // Helper function: Parse score value
    function parseScore(score) {
        if (typeof score === 'string') {
            score = parseFloat(score);
        }
        
        if (isNaN(score) || score === null || score === undefined) {
            return 5.0; // Default value
        }
        
        // Clamp between 0 and 10
        return Math.max(0, Math.min(10, score)).toFixed(1);
    }
    
    // Helper function: Get score class based on value
    function getScoreClass(score) {
        if (score >= 7) {
            return "metric-fill"; // Good (green)
        } else if (score >= 4) {
            return "medium-fill"; // Medium (yellow)
        } else {
            return "bad-fill"; // Bad (red)
        }
    }
});
