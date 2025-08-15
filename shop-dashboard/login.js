// Local Shop Login JavaScript

const API_BASE_URL = 'http://localhost:3001/api';

// Show alert function
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alertDiv);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// API request helper
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json'
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
        throw error;
    }
}

// Login function
async function login(email, password) {
    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        // Store token
        localStorage.setItem('localShopToken', response.data.token);
        
        // Redirect to dashboard
        window.location.href = 'index.html';
        
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

// Register function
async function register() {
    try {
        const formData = {
            username: document.getElementById('reg-username').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            firstName: document.getElementById('reg-firstname').value,
            lastName: document.getElementById('reg-lastname').value,
            phone: document.getElementById('reg-phone').value,
            role: 'shop_owner'
        };
        
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        // Store token
        localStorage.setItem('localShopToken', response.data.token);
        
        // Close modal
        bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
        
        // Show success message and redirect
        showAlert('Account created successfully! Welcome to Local Shop!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        showAlert(error.message, 'danger');
    }
}

// Show register form
function showRegisterForm() {
    const modal = new bootstrap.Modal(document.getElementById('registerModal'));
    modal.show();
}

// Show terms of service
function showTerms() {
    alert('Terms of Service:\n\n1. You agree to provide accurate information\n2. You are responsible for your shop content\n3. You will comply with all applicable laws\n4. We reserve the right to terminate accounts for violations\n\nThis is a demo - please review actual terms before production use.');
}

// Show privacy policy
function showPrivacy() {
    alert('Privacy Policy:\n\n1. We collect information you provide\n2. We use your data to provide services\n3. We do not sell your personal information\n4. We implement security measures to protect your data\n\nThis is a demo - please review actual privacy policy before production use.');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('localShopToken');
    if (token) {
        window.location.href = 'index.html';
    }
    
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            showAlert('Please fill in all required fields', 'warning');
            return;
        }
        
        login(email, password);
    });
    
    // Register form validation
    document.getElementById('register-form').addEventListener('input', function() {
        const password = document.getElementById('reg-password').value;
        const email = document.getElementById('reg-email').value;
        const username = document.getElementById('reg-username').value;
        
        // Basic validation
        if (password.length < 6) {
            document.getElementById('reg-password').setCustomValidity('Password must be at least 6 characters');
        } else {
            document.getElementById('reg-password').setCustomValidity('');
        }
        
        if (username.length < 3) {
            document.getElementById('reg-username').setCustomValidity('Username must be at least 3 characters');
        } else {
            document.getElementById('reg-username').setCustomValidity('');
        }
        
        if (!email.includes('@')) {
            document.getElementById('reg-email').setCustomValidity('Please enter a valid email address');
        } else {
            document.getElementById('reg-email').setCustomValidity('');
        }
    });
});

// Demo login function (for testing)
function demoLogin() {
    // This would be removed in production
    const demoEmail = 'demo@localshop.com';
    const demoPassword = 'demo123';
    
    document.getElementById('email').value = demoEmail;
    document.getElementById('password').value = demoPassword;
    
    showAlert('Demo credentials loaded. Click Login to continue.', 'info');
} 