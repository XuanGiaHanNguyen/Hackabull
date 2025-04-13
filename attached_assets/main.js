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
            let score = analysis.materials_sustainability;
            html += createMetricBar('Materials Sustainability', score, 
                analysis.detailed_justifications && analysis.detailed_justifications.materials ? 
                analysis.detailed_justifications.materials : '');
        }
        
        // Manufacturing process
        if ('manufacturing_process' in analysis) {
            let score = analysis.manufacturing_process;
            html += createMetricBar('Manufacturing Process', score,
                analysis.detailed_justifications && analysis.detailed_justifications.manufacturing ? 
                analysis.detailed_justifications.manufacturing : '');
        }
        
        // Carbon footprint
        if ('carbon_footprint' in analysis) {
            let score = analysis.carbon_footprint;
            html += createMetricBar('Carbon Footprint', score,
                analysis.detailed_justifications && analysis.detailed_justifications.carbon_footprint ? 
                analysis.detailed_justifications.carbon_footprint : '');
        }
        
        // Recyclability
        if ('recyclability' in analysis) {
            let score = analysis.recyclability;
            html += createMetricBar('Recyclability', score,
                analysis.detailed_justifications && analysis.detailed_justifications.recyclability ? 
                analysis.detailed_justifications.recyclability : '');
        }
        
        // Overall score
        if ('overall_sustainability_score' in analysis) {
            let score = analysis.overall_sustainability_score;
            html += createMetricBar('Overall Sustainability Score', score);
        }
        
        // Tags if available
        if (analysis.sustainability_tags) {
            html += '<div class="mt-4 mb-3"><h5>SUSTAINABILITY TAGS</h5></div>';
            html += '<div class="tags-container mb-4">';
            
            let hasTags = false;
            for (const [tag, present] of Object.entries(analysis.sustainability_tags)) {
                if (present) {
                    html += `<span class="sustainability-tag">${tag}</span>`;
                    hasTags = true;
                }
            }
            
            if (!hasTags) {
                html += '<div class="text-muted">No sustainability tags identified</div>';
            }
            
            html += '</div>';
        }
        
        // General comments or claims
        if (analysis.general_comments) {
            html += `
                <div class="justification-box mt-4">
                    <h4>Analysis Notes</h4>
                    <p>${analysis.general_comments}</p>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }
    
    // Create a metric bar for display
    function createMetricBar(metricName, score, justification = '') {
        // Ensure score is a number
        if (typeof score === 'string') {
            score = parseFloat(score);
        }
        
        if (isNaN(score)) {
            score = 0;
        }
        
        // Determine fill class based on score
        let fillClass = 'metric-fill'; // Default good
        if (score <= 3) {
            fillClass = 'bad-fill';
        } else if (score <= 6) {
            fillClass = 'medium-fill';
        }
        
        // Create icon based on score
        let icon = '';
        if (score >= 7) {
            icon = '<i class="fas fa-check-circle text-success me-2"></i>';
        } else if (score <= 3) {
            icon = '<i class="fas fa-exclamation-circle text-danger me-2"></i>';
        } else {
            icon = '<i class="fas fa-info-circle text-warning me-2"></i>';
        }
        
        let html = `
            <div class="metric-container">
                <div class="metric-name">
                    ${icon}${metricName} <span class="metric-score">${score}/10</span>
                </div>
                <div class="metric-bar">
                    <div class="${fillClass}" style="--target-width: ${score * 10}%"></div>
                </div>
        `;
        
        // Add justification if available
        if (justification) {
            html += `<div class="metric-justification">${justification}</div>`;
        }
        
        html += '</div>';
        return html;
    }
    
    // Format text analysis (legacy format)
    function formatTextAnalysis(analysis) {
        if (!analysis) {
            return '<div class="alert alert-warning">No analysis data available.</div>';
        }
        
        // Split by newlines and convert to HTML
        return analysis.split('\n').map(line => {
            // Check if line is a section header
            if (line.startsWith('===')) {
                return '<hr>';
            } else if (line.startsWith('SUSTAINABILITY ANALYSIS RESULTS') || 
                      line.startsWith('PRODUCT IMAGE ANALYSIS')) {
                return `<h4 class="text-success">${line}</h4>`;
            } else if (line.includes(':')) {
                // Check if it's a score line
                const scoreLine = line.match(/^([^:]+): (\d+(\.\d+)?)\/10$/);
                if (scoreLine) {
                    const metric = scoreLine[1];
                    const score = parseFloat(scoreLine[2]);
                    let scoreClass = 'score-medium';
                    
                    if (score >= 7) {
                        scoreClass = 'score-good';
                    } else if (score <= 4) {
                        scoreClass = 'score-bad';
                    }
                    
                    return `
                        <div class="mb-2">
                            <div><strong>${metric}:</strong> ${score}/10</div>
                            <div class="score-indicator">
                                <div class="score-fill ${scoreClass}" style="width: ${score * 10}%"></div>
                            </div>
                        </div>
                    `;
                }
                // For section headers
                else if (line.length > 0 && line === line.toUpperCase() && !line.startsWith('✓')) {
                    return `<h5 class="mt-3">${line}</h5>`;
                }
                // For normal key-value pairs
                else {
                    const parts = line.split(':');
                    return `<div><strong>${parts[0]}:</strong> ${parts.slice(1).join(':')}</div>`;
                }
            } else if (line.startsWith('✓')) {
                return `<div class="product-tag">${line}</div>`;
            } else if (line.startsWith('-')) {
                return `<div class="improvement-item">${line}</div>`;
            } else if (line.trim() === '') {
                return '<br>';
            } else {
                return `<div>${line}</div>`;
            }
        }).join('');
    }
    
    // Display alternatives
    function displayAlternatives(alternatives) {
        const container = $('#alternatives-content');
        container.empty();
        
        if (alternatives && alternatives.length > 0) {
            const row = $('<div>').addClass('row');
            
            alternatives.forEach(function(alt, index) {
                const colDiv = $('<div>').addClass('col-md-4 mb-4');
                const card = createAlternativeCard(alt);
                colDiv.append(card);
                row.append(colDiv);
            });
            
            container.append(row);
        } else {
            container.html('<div class="alert alert-info">No alternatives found. Try a different product or category.</div>');
        }
    }
    
    // Create a card for an alternative product
    function createAlternativeCard(alternative) {
        const product = alternative.product;
        const card = $('<div>').addClass('product-card fade-in');
        
        // Product name
        card.append(`<div class="product-name">${product.name}</div>`);
        
        // Price
        card.append(`<div class="product-price">$${product.price.toFixed(2)}</div>`);
        
        // Description (truncated)
        if (product.description) {
            let description = product.description;
            const maxLength = 120;
            
            if (description.length > maxLength) {
                description = description.substring(0, maxLength) + '...';
            }
            
            card.append(`<div class="product-description">${description}</div>`);
        }
        
        // Improvement reasons
        if (alternative.improvement_reasons && alternative.improvement_reasons.length > 0) {
            const improvements = $('<div>').addClass('improvements-container');
            
            // Take up to 3 improvements to display
            alternative.improvement_reasons.slice(0, 3).forEach(function(reason) {
                improvements.append(`<div class="improvement-item">${reason}</div>`);
            });
            
            card.append(improvements);
        }
        
        // Sustainability score badge
        if (product.sustainability_metrics && product.sustainability_metrics.overall_sustainability_score) {
            const score = product.sustainability_metrics.overall_sustainability_score;
            let badgeClass = 'bg-success';
            
            if (score < 4) {
                badgeClass = 'bg-danger';
            } else if (score < 7) {
                badgeClass = 'bg-warning text-dark';
            }
            
            card.append(`
                <div class="text-center mt-auto mb-3">
                    <span class="badge ${badgeClass} p-2">
                        Sustainability Score: ${score}/10
                    </span>
                </div>
            `);
        }
        
        // Product link
        if (alternative.product_url) {
            card.append(`
                <a href="${alternative.product_url}" target="_blank" class="product-link">
                    <i class="fas fa-external-link-alt me-1"></i> View Product
                </a>
            `);
        }
        
        return card;
    }
    
    // Load categories
    function loadCategories() {
        $.ajax({
            url: '/categories',
            method: 'GET',
            success: function(response) {
                displayCategories(response.categories);
            },
            error: function() {
                $('#categories-list').html('<div class="alert alert-danger">Error loading categories. Please refresh the page.</div>');
            }
        });
    }
    
    // Display categories
    function displayCategories(categories) {
        const container = $('#categories-list');
        container.empty();
        
        if (categories && categories.length > 0) {
            categories.forEach(function(category) {
                const button = $('<button>')
                    .addClass('category-btn')
                    .text(category)
                    .click(function() {
                        loadCategoryProducts(category);
                    });
                container.append(button);
            });
        } else {
            container.html('<div class="alert alert-info">No categories available.</div>');
        }
    }
    
    // Load category products
    function loadCategoryProducts(category) {
        // Show loading spinner
        $('#category-content').html('<div class="spinner-container"><div class="spinner"></div><p>Loading eco-friendly products...</p></div>');
        $('#category-results').show();
        $('#category-title').html(`<i class="fas fa-list me-2"></i>${category} Products`);
        
        // Get category products
        $.ajax({
            url: '/category_products',
            method: 'POST',
            data: {
                category: category
            },
            success: function(response) {
                displayAlternativesInCategory(response.formatted_suggestions);
                
                // Scroll to results
                $('html, body').animate({
                    scrollTop: $('#category-results').offset().top - 70
                }, 500);
            },
            error: function() {
                $('#category-content').html('<div class="alert alert-danger">Error loading products. Please try again.</div>');
            }
        });
    }
    
    // Display alternatives in category
    function displayAlternativesInCategory(alternatives) {
        const container = $('#category-content');
        container.empty();
        
        if (alternatives && alternatives.length > 0) {
            alternatives.forEach(function(alt, index) {
                const productCard = createProductCard(alt.formatted, index);
                container.append(productCard);
            });
        } else {
            container.html('<div class="alert alert-info">No products found in this category.</div>');
        }
    }
    
    // Create product card
    function createProductCard(formattedProduct, index) {
        const cardDiv = $('<div>').addClass('col-md-4');
        const card = $('<div>').addClass('product-card fade-in');
        
        // Split the formatted product by lines
        const lines = formattedProduct.split('\n');
        let productName = '';
        let price = '';
        let link = '';
        let description = '';
        let improvements = [];
        
        lines.forEach(line => {
            if (line.startsWith('PRODUCT:')) {
                productName = line.replace('PRODUCT:', '').trim();
            } else if (line.startsWith('Price:')) {
                price = line.trim();
            } else if (line.startsWith('Link:')) {
                link = line.replace('Link:', '').trim();
            } else if (line.startsWith('Description:')) {
                description = line.replace('Description:', '').trim();
            } else if (line.startsWith('✓')) {
                improvements.push(line.trim());
            }
        });
        
        // Append elements to card
        card.append(`<div class="product-name">${productName}</div>`);
        card.append(`<div class="product-price">${price}</div>`);
        
        if (improvements.length > 0) {
            const improvementsDiv = $('<div>').addClass('mt-2');
            improvements.slice(0, 3).forEach(improvement => {
                improvementsDiv.append(`<div class="improvement-item">${improvement}</div>`);
            });
            card.append(improvementsDiv);
        }
        
        if (description) {
            card.append(`<div class="product-description">${description.substring(0, 150)}${description.length > 150 ? '...' : ''}</div>`);
        }
        
        if (link) {
            card.append(`<a href="${link}" target="_blank" class="product-link">View Product <i class="fas fa-external-link-alt"></i></a>`);
        }
        
        cardDiv.append(card);
        return cardDiv;
    }
    
    // Display greenwashing results
    function displayGreenwashing(greenwashing) {
        const container = $('#greenwashing-content');
        container.empty();
        
        if (greenwashing) {
            let riskScore = greenwashing.greenwashing_risk;
            if (typeof riskScore === 'string') {
                riskScore = parseFloat(riskScore);
            }
            
            let scoreClass = 'score-medium';
            if (riskScore <= 3) {
                scoreClass = 'score-good';
            } else if (riskScore >= 7) {
                scoreClass = 'score-bad';
            }
            
            let html = `
                <div class="mb-3">
                    <h5>Greenwashing Risk Score: ${riskScore}/10</h5>
                    <div class="score-indicator">
                        <div class="score-fill ${scoreClass}" style="width: ${riskScore * 10}%"></div>
                    </div>
                </div>
            `;
            
            if (greenwashing.issues && greenwashing.issues.length > 0) {
                html += '<h5>Potential Greenwashing Issues:</h5>';
                html += '<ul class="list-group mb-3">';
                greenwashing.issues.forEach(issue => {
                    html += `<li class="list-group-item list-group-item-warning">${issue}</li>`;
                });
                html += '</ul>';
            }
            
            if (greenwashing.explanation) {
                html += '<h5>Explanation:</h5>';
                html += `<div class="alert alert-light">${greenwashing.explanation}</div>`;
            }
            
            container.html(html);
        } else {
            container.html('<div class="alert alert-info">No greenwashing assessment available.</div>');
        }
    }
    
    // Display material alternatives
    function displayMaterialAlternatives(alternatives) {
        const container = $('#materials-content');
        container.empty();
        
        if (alternatives && Object.keys(alternatives).length > 0) {
            Object.keys(alternatives).forEach(material => {
                const materialDiv = $('<div>').addClass('material-alternative');
                materialDiv.append(`<div class="material-name">${material}</div>`);
                
                const altsList = alternatives[material];
                if (altsList && altsList.length > 0) {
                    altsList.forEach(alt => {
                        const altItem = $('<div>').addClass('alternative-item');
                        altItem.append(`<div class="alternative-name">${alt.name}</div>`);
                        
                        if (alt.benefits) {
                            altItem.append('<div><strong>Benefits:</strong></div>');
                            altItem.append(`<div class="benefits-list">${alt.benefits}</div>`);
                        }
                        
                        if (alt.considerations) {
                            altItem.append('<div><strong>Considerations:</strong></div>');
                            altItem.append(`<div class="considerations-list">${alt.considerations}</div>`);
                        }
                        
                        materialDiv.append(altItem);
                    });
                } else {
                    materialDiv.append('<div class="alert alert-info">No alternatives found for this material.</div>');
                }
                
                container.append(materialDiv);
            });
        } else {
            container.html('<div class="alert alert-info">No material alternatives found.</div>');
        }
    }
}); 