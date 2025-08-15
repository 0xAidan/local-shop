// Local Shop Dashboard JavaScript

// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Global variables
let currentUser = null;
let userToken = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('localShopToken');
    if (token) {
        userToken = token;
        loadUserProfile();
        loadDashboard();
    } else {
        // Redirect to login if no token
        window.location.href = 'login.html';
    }
});

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(userToken && { 'Authorization': `Bearer ${userToken}` })
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        showAlert(error.message, 'danger');
        throw error;
    }
}

// UI Helper Functions
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.main-content');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function showSection(sectionName) {
    // Hide all sections
    const sections = ['overview', 'shops', 'products', 'orders', 'profile'];
    sections.forEach(section => {
        document.getElementById(`${section}-section`).style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(`${sectionName}-section`).style.display = 'block';
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Load section-specific data
    switch(sectionName) {
        case 'overview':
            loadDashboard();
            break;
        case 'shops':
            loadShops();
            break;
        case 'products':
            loadProducts();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// Dashboard Functions
async function loadDashboard() {
    try {
        const [userData, shopsData, productsData] = await Promise.all([
            apiRequest('/auth/me'),
            apiRequest('/users/shops'),
            apiRequest('/products?limit=100')
        ]);
        
        currentUser = userData.data;
        
        // Update dashboard stats
        document.getElementById('total-shops').textContent = shopsData.data.length;
        document.getElementById('total-products').textContent = productsData.data.length;
        
        // Calculate average rating
        const totalRating = shopsData.data.reduce((sum, shop) => sum + (shop.rating?.average || 0), 0);
        const avgRating = shopsData.data.length > 0 ? (totalRating / shopsData.data.length).toFixed(1) : '0.0';
        document.getElementById('avg-rating').textContent = avgRating;
        
        // Load recent activity
        loadRecentActivity();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function loadRecentActivity() {
    const activityDiv = document.getElementById('recent-activity');
    activityDiv.innerHTML = `
        <div class="d-flex align-items-center mb-3">
            <i class="fas fa-store text-primary me-3"></i>
            <div>
                <strong>Dashboard loaded</strong>
                <br><small class="text-muted">Just now</small>
            </div>
        </div>
        <div class="d-flex align-items-center">
            <i class="fas fa-user text-success me-3"></i>
            <div>
                <strong>Welcome back!</strong>
                <br><small class="text-muted">Ready to manage your shops</small>
            </div>
        </div>
    `;
}

// Shop Management Functions
async function loadShops() {
    try {
        const response = await apiRequest('/users/shops');
        const shops = response.data;
        
        const shopsList = document.getElementById('shops-list');
        shopsList.innerHTML = '';
        
        if (shops.length === 0) {
            shopsList.innerHTML = `
                <div class="col-12">
                    <div class="card text-center p-5">
                        <i class="fas fa-store fa-3x text-muted mb-3"></i>
                        <h4>No shops yet</h4>
                        <p class="text-muted">Create your first shop to get started!</p>
                        <button class="btn btn-primary" onclick="showAddShopModal()">
                            <i class="fas fa-plus me-2"></i>Create Your First Shop
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        shops.forEach(shop => {
            const shopCard = createShopCard(shop);
            shopsList.appendChild(shopCard);
        });
        
    } catch (error) {
        console.error('Error loading shops:', error);
    }
}

function createShopCard(shop) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    
    const statusBadge = shop.isActive ? 
        '<span class="badge bg-success status-badge">Active</span>' : 
        '<span class="badge bg-secondary status-badge">Inactive</span>';
    
    col.innerHTML = `
        <div class="card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title mb-0">${shop.name}</h5>
                    ${statusBadge}
                </div>
                <p class="text-muted small">${shop.category}</p>
                <p class="card-text">${shop.description || 'No description available'}</p>
                <div class="d-flex align-items-center mb-2">
                    <i class="fas fa-star text-warning me-1"></i>
                    <span>${shop.rating?.average?.toFixed(1) || '0.0'} (${shop.rating?.count || 0})</span>
                </div>
                <div class="d-flex align-items-center text-muted small mb-3">
                    <i class="fas fa-map-marker-alt me-1"></i>
                    <span>${shop.location?.city}, ${shop.location?.state}</span>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="editShop('${shop._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="manageProducts('${shop._id}')">
                        <i class="fas fa-box"></i> Products
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteShop('${shop._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

function showAddShopModal() {
    // Clear form
    document.getElementById('add-shop-form').reset();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addShopModal'));
    modal.show();
}

async function createShop() {
    try {
        const formData = {
            name: document.getElementById('shop-name').value,
            description: document.getElementById('shop-description').value,
            category: document.getElementById('shop-category').value,
            location: {
                address: document.getElementById('shop-address').value,
                city: document.getElementById('shop-city').value,
                state: document.getElementById('shop-state').value,
                zipCode: document.getElementById('shop-zipcode').value
            },
            contact: {
                phone: document.getElementById('shop-phone').value,
                email: document.getElementById('shop-email').value
            },
            features: getSelectedFeatures()
        };
        
        await apiRequest('/shops', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        // Close modal and reload
        bootstrap.Modal.getInstance(document.getElementById('addShopModal')).hide();
        showAlert('Shop created successfully!', 'success');
        loadShops();
        loadDashboard();
        
    } catch (error) {
        console.error('Error creating shop:', error);
    }
}

function getSelectedFeatures() {
    const features = [];
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        if (checkbox.value) {
            features.push(checkbox.value);
        }
    });
    return features;
}

// Product Management Functions
async function loadProducts() {
    try {
        const response = await apiRequest('/products?limit=100');
        const products = response.data;
        
        const productsTable = document.getElementById('products-table');
        productsTable.innerHTML = '';
        
        if (products.length === 0) {
            productsTable.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <i class="fas fa-box fa-2x text-muted mb-2"></i>
                        <p class="text-muted">No products yet</p>
                        <button class="btn btn-primary" onclick="showAddProductModal()">
                            <i class="fas fa-plus me-2"></i>Add Your First Product
                        </button>
                    </td>
                </tr>
            `;
            return;
        }
        
        products.forEach(product => {
            const row = createProductRow(product);
            productsTable.appendChild(row);
        });
        
        // Load shops for product creation
        loadShopsForProducts();
        
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function createProductRow(product) {
    const row = document.createElement('tr');
    
    const stockStatus = product.inventory?.isUnlimited ? 'Unlimited' : 
        product.inventory?.quantity > 0 ? `${product.inventory.quantity} ${product.inventory.unit}` : 'Out of Stock';
    
    const statusBadge = product.isAvailable ? 
        '<span class="badge bg-success status-badge">Available</span>' : 
        '<span class="badge bg-secondary status-badge">Unavailable</span>';
    
    row.innerHTML = `
        <td>
            <img src="${product.images?.[0]?.url || 'https://via.placeholder.com/60x60?text=No+Image'}" 
                 class="product-image" alt="${product.name}">
        </td>
        <td>
            <strong>${product.name}</strong>
            <br><small class="text-muted">${product.description?.substring(0, 50)}${product.description?.length > 50 ? '...' : ''}</small>
        </td>
        <td>${product.category}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>${stockStatus}</td>
        <td>${statusBadge}</td>
        <td>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="editProduct('${product._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline-warning" onclick="updateInventory('${product._id}')">
                    <i class="fas fa-warehouse"></i>
                </button>
                <button class="btn btn-outline-danger" onclick="deleteProduct('${product._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

async function loadShopsForProducts() {
    try {
        const response = await apiRequest('/users/shops');
        const shops = response.data;
        
        const shopSelect = document.getElementById('product-shop');
        shopSelect.innerHTML = '<option value="">Select Shop</option>';
        
        shops.forEach(shop => {
            const option = document.createElement('option');
            option.value = shop._id;
            option.textContent = shop.name;
            shopSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading shops for products:', error);
    }
}

function showAddProductModal() {
    // Clear form
    document.getElementById('add-product-form').reset();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
    modal.show();
}

async function createProduct() {
    try {
        const formData = {
            name: document.getElementById('product-name').value,
            description: document.getElementById('product-description').value,
            price: parseFloat(document.getElementById('product-price').value),
            category: document.getElementById('product-category').value,
            shop: document.getElementById('product-shop').value,
            inventory: {
                quantity: parseInt(document.getElementById('product-quantity').value),
                unit: document.getElementById('product-unit').value,
                lowStockThreshold: parseInt(document.getElementById('product-lowstock').value)
            },
            dietary: {
                isOrganic: document.getElementById('dietary-organic').checked,
                isVegan: document.getElementById('dietary-vegan').checked,
                isGlutenFree: document.getElementById('dietary-gluten').checked,
                isVegetarian: document.getElementById('dietary-vegetarian').checked,
                isHalal: document.getElementById('dietary-halal').checked,
                isKosher: document.getElementById('dietary-kosher').checked
            }
        };
        
        await apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        // Close modal and reload
        bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
        showAlert('Product created successfully!', 'success');
        loadProducts();
        loadDashboard();
        
    } catch (error) {
        console.error('Error creating product:', error);
    }
}

// Profile Management Functions
async function loadProfile() {
    try {
        const response = await apiRequest('/auth/me');
        const user = response.data;
        
        // Populate form fields
        document.getElementById('profile-firstname').value = user.firstName || '';
        document.getElementById('profile-lastname').value = user.lastName || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-phone').value = user.phone || '';
        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function loadUserProfile() {
    try {
        const response = await apiRequest('/auth/me');
        currentUser = response.data;
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Token might be invalid, redirect to login
        localStorage.removeItem('localShopToken');
        window.location.href = 'login.html';
    }
}

// Event Listeners
document.getElementById('profile-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const formData = {
            firstName: document.getElementById('profile-firstname').value,
            lastName: document.getElementById('profile-lastname').value,
            phone: document.getElementById('profile-phone').value
        };
        
        await apiRequest('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        showAlert('Profile updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating profile:', error);
    }
});

document.getElementById('password-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const formData = {
            currentPassword: document.getElementById('current-password').value,
            newPassword: document.getElementById('new-password').value
        };
        
        await apiRequest('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        // Clear form
        document.getElementById('password-form').reset();
        showAlert('Password changed successfully!', 'success');
        
    } catch (error) {
        console.error('Error changing password:', error);
    }
});

// Utility Functions
function logout() {
    localStorage.removeItem('localShopToken');
    window.location.href = 'login.html';
}

// Placeholder functions for future implementation
function editShop(shopId) {
    showAlert('Edit shop functionality coming soon!', 'info');
}

function deleteShop(shopId) {
    if (confirm('Are you sure you want to delete this shop? This action cannot be undone.')) {
        showAlert('Delete shop functionality coming soon!', 'info');
    }
}

function manageProducts(shopId) {
    showSection('products');
    showAlert('Filtering products for this shop coming soon!', 'info');
}

function editProduct(productId) {
    showAlert('Edit product functionality coming soon!', 'info');
}

function updateInventory(productId) {
    showAlert('Update inventory functionality coming soon!', 'info');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        showAlert('Delete product functionality coming soon!', 'info');
    }
} 