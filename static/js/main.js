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
                    $('#image-analysis-content').html(response.formatted_analysis || formatAnalysisObject(response.analysis));
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
    
    // Helper Functions
    function formatAnalysisObject(analysis) {
        if (!analysis) {
            return '<div class="alert alert-warning">No analysis data available.</div>';
        }
        
        if (analysis.error) {
            return `<div class="alert alert-danger">${analysis.error}</div>`;
        }
        
        let html = '<div class="analysis-container">';
        
        // Overall sustainability score
        if (analysis.overall_sustainability_score !== undefined) {
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
        
        // Materials sustainability
        if (analysis.materials_sustainability !== undefined) {
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
        if (analysis.manufacturing_process !== undefined) {
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
        if (analysis.carbon_footprint !== undefined) {
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
        if (analysis.recyclability !== undefined) {
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
        
        // Sustainability tags
        if (analysis.sustainability_tags && typeof analysis.sustainability_tags === 'object') {
            html += '<div class="metric-container"><h5>Sustainability Tags</h5><div class="tags-container">';
            
            for (const [tag, value] of Object.entries(analysis.sustainability_tags)) {
                if (value && value !== false && value !== "false" && value !== "False") {
                    const tagName = tag.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                    html += `<span class="sustainability-tag">${tagName}</span>`;
                }
            }
            
            html += '</div></div>';
        }
        
        // Improvement opportunities
        if (analysis.improvement_opportunities && analysis.improvement_opportunities.length > 0) {
            html += '<div class="metric-container"><h5>Improvement Opportunities</h5><ul class="list-group">';
            
            for (const opportunity of analysis.improvement_opportunities) {
                html += `<li class="list-group-item">${opportunity}</li>`;
            }
            
            html += '</ul></div>';
        }
        
        // Sustainability justification
        if (analysis.sustainability_justification) {
            html += `
            <div class="metric-container">
                <h5>Assessment Explanation</h5>
                <div class="metric-justification">${analysis.sustainability_justification}</div>
            </div>
            `;
        }
        
        html += '</div>';
        return html;
    }
    
    function displayAlternatives(alternatives) {
        let html = '';
        
        alternatives.forEach(function(alternative, index) {
            const colClass = alternatives.length > 2 ? 'col-md-4' : 'col-md-6';
            html += `<div class="${colClass} mb-4">`;
            
            if (alternative.product) {
                // Format the product content
                const product = alternative.product;
                const name = product.name || 'Alternative Product';
                const price = product.price || '';
                const description = product.description || '';
                const url = product.url || '#';
                
                html += `
                <div class="product-card">
                    <div class="product-name">${name}</div>
                `;
                
                if (price) {
                    html += `<div class="product-price">$${parseFloat(price).toFixed(2)}</div>`;
                }
                
                html += `<div class="product-description">${description}</div>`;
                
                // Add improvement reasons if available
                if (alternative.improvement_reasons && alternative.improvement_reasons.length > 0) {
                    html += '<div class="improvements-container"><h6>Sustainability Improvements:</h6>';
                    
                    alternative.improvement_reasons.forEach(function(reason) {
                        html += `<div class="improvement-item">${reason}</div>`;
                    });
                    
                    html += '</div>';
                }
                
                if (url && url !== '#') {
                    html += `<a href="${url}" class="product-link" target="_blank">View Product</a>`;
                }
                
                html += `</div>`;
            } else {
                // If the alternative doesn't have a product object
                html += `
                <div class="product-card">
                    <div class="product-name">Alternative ${index + 1}</div>
                    <div class="product-description">No detailed information available.</div>
                </div>
                `;
            }
            
            html += '</div>';
        });
        
        $('#alternatives-content').html(html);
    }
    
    function displayGreenwashing(greenwashing) {
        if (!greenwashing) {
            $('#greenwashing-content').html('<div class="alert alert-warning">No greenwashing analysis available.</div>');
            return;
        }
        
        if (greenwashing.error) {
            $('#greenwashing-content').html(`<div class="alert alert-danger">${greenwashing.error}</div>`);
            return;
        }
        
        let html = '<div class="analysis-container">';
        
        // Greenwashing risk
        if (greenwashing.greenwashing_risk) {
            let riskClass = '';
            switch (greenwashing.greenwashing_risk.toLowerCase()) {
                case 'high':
                    riskClass = 'text-danger fw-bold';
                    break;
                case 'medium':
                    riskClass = 'text-warning fw-bold';
                    break;
                case 'low':
                    riskClass = 'text-success fw-bold';
                    break;
                default:
                    riskClass = '';
            }
            
            html += `
            <div class="metric-container">
                <h5>Greenwashing Risk</h5>
                <p class="${riskClass}">${greenwashing.greenwashing_risk}</p>
            </div>
            `;
        }
        
        // Issues
        if (greenwashing.issues && greenwashing.issues.length > 0) {
            html += '<div class="metric-container"><h5>Potential Issues</h5><ul class="list-group">';
            
            greenwashing.issues.forEach(function(issue) {
                html += `<li class="list-group-item list-group-item-warning">${issue}</li>`;
            });
            
            html += '</ul></div>';
        }
        
        // Vague claims
        if (greenwashing.vague_claims && greenwashing.vague_claims.length > 0) {
            html += '<div class="metric-container"><h5>Vague Environmental Claims</h5><ul class="list-group">';
            
            greenwashing.vague_claims.forEach(function(claim) {
                html += `<li class="list-group-item">${claim}</li>`;
            });
            
            html += '</ul></div>';
        }
        
        // Explanation
        if (greenwashing.explanation) {
            html += `
            <div class="metric-container">
                <h5>Explanation</h5>
                <div class="metric-justification">${greenwashing.explanation}</div>
            </div>
            `;
        }
        
        // Recommendations
        if (greenwashing.recommendations && greenwashing.recommendations.length > 0) {
            html += '<div class="metric-container"><h5>Recommendations</h5><ul class="list-group">';
            
            greenwashing.recommendations.forEach(function(recommendation) {
                html += `<li class="list-group-item list-group-item-info">${recommendation}</li>`;
            });
            
            html += '</ul></div>';
        }
        
        html += '</div>';
        
        $('#greenwashing-content').html(html);
    }
    
    function displayMaterialAlternatives(alternatives) {
        if (!alternatives || Object.keys(alternatives).length === 0) {
            $('#materials-content').html('<div class="alert alert-warning">No alternatives found for the specified materials.</div>');
            return;
        }
        
        let html = '';
        
        for (const [material, materialAlternatives] of Object.entries(alternatives)) {
            if (!materialAlternatives || materialAlternatives.length === 0) continue;
            
            html += `
            <div class="material-alternative">
                <div class="material-name">${material}</div>
                <div class="alternatives-list">
            `;
            
            materialAlternatives.forEach(function(alt) {
                html += `
                <div class="alternative-item">
                    <div class="alternative-name">${alt.name || 'Alternative'}</div>
                `;
                
                if (alt.benefits) {
                    html += `<div><strong>Benefits:</strong> ${alt.benefits}</div>`;
                }
                
                if (alt.considerations) {
                    html += `<div><strong>Considerations:</strong> ${alt.considerations}</div>`;
                }
                
                html += '</div>';
            });
            
            html += '</div></div>';
        }
        
        $('#materials-content').html(html);
    }
    
    function loadCategories() {
        $.ajax({
            url: '/categories',
            method: 'GET',
            success: function(response) {
                if (response.categories && response.categories.length > 0) {
                    displayCategories(response.categories);
                } else {
                    $('#categories-list').html('<div class="alert alert-info">No product categories available.</div>');
                }
            },
            error: function() {
                $('#categories-list').html('<div class="alert alert-danger">Error loading categories. Please refresh the page.</div>');
            }
        });
    }
    
    function displayCategories(categories) {
        let html = '';
        
        categories.forEach(function(category) {
            const icon = category.icon ? `<i class="fas fa-${category.icon} me-2"></i>` : '';
            const name = category.name || category.id;
            const id = category.id;
            
            html += `
            <div class="col-6 col-md-4 col-lg-3 mb-3">
                <button class="category-btn w-100" data-category="${id}">
                    ${icon}${name}
                </button>
            </div>
            `;
        });
        
        $('#categories-list').html(html);
        
        // Add click handlers for category buttons
        $('.category-btn').click(function() {
            const category = $(this).data('category');
            $('#category-title').html(`<i class="fas fa-list me-2"></i>${$(this).text().trim()} Products`);
            loadCategoryProducts(category);
        });
    }
    
    function loadCategoryProducts(category) {
        // Show loading spinner
        $('#category-content').html('<div class="spinner-container"><div class="spinner"></div><p>Loading eco-friendly products...</p></div>');
        $('#category-results').show();
        
        // Scroll to category results
        $('html, body').animate({
            scrollTop: $('#category-results').offset().top - 70
        }, 500);
        
        // Load products for the category
        $.ajax({
            url: `/category_products/${category}`,
            method: 'GET',
            success: function(response) {
                if (response.products && response.products.length > 0) {
                    displayAlternatives(response.products);
                } else {
                    $('#category-content').html('<div class="alert alert-warning">No products found in this category.</div>');
                }
            },
            error: function() {
                $('#category-content').html('<div class="alert alert-danger">Error loading products. Please try again.</div>');
            }
        });
    }
    
    // Helper function to parse score values
    function parseScore(score) {
        if (typeof score === 'string') {
            // Remove any trailing /10 or similar
            score = score.split('/')[0].trim();
            score = parseFloat(score);
        } else if (typeof score === 'number') {
            score = score;
        } else {
            score = 0;
        }
        
        // Scale to 0-10 if it appears to be on a 0-100 scale
        if (score > 10) {
            score = score / 10;
        }
        
        // Clamp to 0-10 and round to 1 decimal place
        return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
    }
    
    // Helper function to get CSS class for score
    function getScoreClass(score) {
        if (score >= 7) {
            return "metric-fill"; // Good (green)
        } else if (score >= 4) {
            return "medium-fill"; // Medium (yellow/orange)
        } else {
            return "bad-fill"; // Bad (red)
        }
    }
});