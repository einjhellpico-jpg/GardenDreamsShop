// Garden Dreams - Interactive JavaScript

// ==================== GLOBAL VARIABLES ====================
let cart = JSON.parse(localStorage.getItem('gardenDreamsCart')) || [];
let favorites = JSON.parse(localStorage.getItem('gardenDreamsFavorites')) || [];

// ==================== MOBILE MENU TOGGLE ====================
const toggler = document.getElementById('toggler');
const navbar = document.querySelector('.navbar');

if (toggler) {
    toggler.addEventListener('change', function() {
        if (this.checked) {
            navbar.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)';
        } else {
            navbar.style.clipPath = 'polygon(0 0, 100% 0, 0 0)';
        }
    });
}

// Close menu when clicking on a link
const navLinks = document.querySelectorAll('.navbar a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (toggler) {
            toggler.checked = false;
            navbar.style.clipPath = 'polygon(0 0, 100% 0, 0 0)';
        }
    });
});

// ==================== SMOOTH SCROLLING ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== HEADER SCROLL EFFECT ====================
const header = document.querySelector('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 .5rem 2rem rgba(0,0,0,.2)';
    } else {
        header.style.boxShadow = '0 .5rem 1rem rgba(0,0,0,.1)';
    }
    
    lastScroll = currentScroll;
});

// ==================== SHOPPING CART FUNCTIONALITY ====================
class ShoppingCart {
    constructor() {
        this.items = cart;
        this.updateCartIcon();
    }

    addItem(product) {
        const existingItem = this.items.find(item => item.name === product.name);
        
        if (existingItem) {
            existingItem.quantity += 1;
            this.showNotification(`${product.name} quantity updated in cart!`);
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
            this.showNotification(`${product.name} added to cart!`);
        }
        
        this.saveCart();
        this.updateCartIcon();
        this.showCartPreview(product);
    }

    removeItem(productName) {
        this.items = this.items.filter(item => item.name !== productName);
        this.saveCart();
        this.updateCartIcon();
    }

    updateQuantity(productName, quantity) {
        const item = this.items.find(item => item.name === productName);
        if (item) {
            item.quantity = quantity;
            if (quantity <= 0) {
                this.removeItem(productName);
            } else {
                this.saveCart();
                this.updateCartIcon();
            }
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('gardenDreamsCart', JSON.stringify(this.items));
    }

    updateCartIcon() {
        const cartIcon = document.querySelector('.fa-shopping-cart');
        if (cartIcon) {
            const count = this.getItemCount();
            
            // Remove existing badge if any
            const existingBadge = cartIcon.parentElement.querySelector('.cart-badge');
            if (existingBadge) {
                existingBadge.remove();
            }
            
            // Add new badge if items exist
            if (count > 0) {
                const badge = document.createElement('span');
                badge.className = 'cart-badge';
                badge.textContent = count;
                badge.style.cssText = `
                    position: absolute;
                    top: -5px;
                    right: -10px;
                    background: #e84393;
                    color: white;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: bold;
                `;
                cartIcon.parentElement.style.position = 'relative';
                cartIcon.parentElement.appendChild(badge);
            }
        }
    }

    showNotification(message) {
        // Remove existing notification
        const existingNotif = document.querySelector('.cart-notification');
        if (existingNotif) {
            existingNotif.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #e84393;
            color: white;
            padding: 1.5rem 2rem;
            border-radius: 5px;
            box-shadow: 0 .5rem 1rem rgba(0,0,0,.3);
            z-index: 10000;
            font-size: 1.4rem;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    showCartPreview(product) {
        // This could open a modal or side panel - for now just show notification
        console.log('Cart preview for:', product);
    }
}

// Initialize cart
const shoppingCart = new ShoppingCart();

// ==================== ADD TO CART BUTTONS ====================
const cartButtons = document.querySelectorAll('.cart-btn');
cartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Find the product box
        const productBox = button.closest('.box');
        const productName = productBox.querySelector('h3').textContent;
        const priceText = productBox.querySelector('.price').textContent.trim();
        const price = parseFloat(priceText.replace('₱', '').replace(',', '').split(' ')[0]);
        const discount = productBox.querySelector('.discount')?.textContent || '0%';
        const image = productBox.querySelector('.image img').src;
        const flowerCount = productBox.querySelector('.flower-count')?.textContent || '10 stems';
        
        const product = {
            name: productName,
            price: price,
            discount: discount,
            image: image,
            flowerCount: flowerCount
        };
        
        shoppingCart.addItem(product);
        
        // Animate button
        button.style.transform = 'scale(0.9)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 200);
    });
});

// ==================== FAVORITES FUNCTIONALITY ====================
class Favorites {
    constructor() {
        this.items = favorites;
        this.updateFavoriteIcon();
    }

    toggleFavorite(product) {
        const index = this.items.findIndex(item => item.name === product.name);
        
        if (index > -1) {
            this.items.splice(index, 1);
            this.showNotification(`${product.name} removed from favorites`);
            return false;
        } else {
            this.items.push(product);
            this.showNotification(`${product.name} added to favorites!`);
            return true;
        }
    }

    isFavorite(productName) {
        return this.items.some(item => item.name === productName);
    }

    saveFavorites() {
        localStorage.setItem('gardenDreamsFavorites', JSON.stringify(this.items));
    }

    updateFavoriteIcon() {
        const favoriteIcon = document.querySelector('.icons .fa-heart');
        if (favoriteIcon && this.items.length > 0) {
            favoriteIcon.style.color = '#e84393';
        }
    }

    showNotification(message) {
        shoppingCart.showNotification(message);
    }
}

const favoritesManager = new Favorites();

// ==================== FAVORITE HEART BUTTONS ====================
const heartButtons = document.querySelectorAll('.icons .fa-heart');
heartButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Check if it's a product heart or header heart
        if (button.closest('.box')) {
            const productBox = button.closest('.box');
            const productName = productBox.querySelector('h3').textContent;
            const priceText = productBox.querySelector('.price').textContent.trim();
            const price = parseFloat(priceText.replace('₱', '').replace(',', '').split(' ')[0]);
            const image = productBox.querySelector('.image img').src;
            
            const product = {
                name: productName,
                price: price,
                image: image
            };
            
            const isFavorite = favoritesManager.toggleFavorite(product);
            favoritesManager.saveFavorites();
            
            // Update button style
            if (isFavorite) {
                button.style.color = '#e84393';
                button.classList.add('fas');
                button.classList.remove('far');
            } else {
                button.style.color = '';
                button.classList.add('far');
                button.classList.remove('fas');
            }
        }
    });
});

// Initialize favorite states on page load
document.querySelectorAll('.products .box').forEach(box => {
    const productName = box.querySelector('h3').textContent;
    const heartBtn = box.querySelector('.fa-heart');
    
    if (favoritesManager.isFavorite(productName)) {
        heartBtn.style.color = '#e84393';
        heartBtn.classList.add('fas');
        heartBtn.classList.remove('far');
    }
});

// ==================== SHARE FUNCTIONALITY ====================
const shareButtons = document.querySelectorAll('.fa-share');
shareButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const productBox = button.closest('.box');
        const productName = productBox.querySelector('h3').textContent;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${productName} - Garden Dreams`,
                    text: `Check out this beautiful ${productName} from Garden Dreams!`,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share cancelled or failed');
            }
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            shoppingCart.showNotification('Link copied to clipboard!');
        }
    });
});

// ==================== CONTACT FORM VALIDATION ====================
const contactForm = document.querySelector('.contact form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = contactForm.querySelector('input[type="text"]').value.trim();
        const email = contactForm.querySelector('input[type="email"]').value.trim();
        const number = contactForm.querySelector('input[type="number"]').value.trim();
        const message = contactForm.querySelector('textarea').value.trim();
        
        // Validation
        if (!name) {
            showFormError('Please enter your name');
            return;
        }
        
        if (!email || !isValidEmail(email)) {
            showFormError('Please enter a valid email address');
            return;
        }
        
        if (!number || number.length < 10) {
            showFormError('Please enter a valid phone number');
            return;
        }
        
        if (!message || message.length < 10) {
            showFormError('Please enter a message (at least 10 characters)');
            return;
        }
        
        // Success
        showFormSuccess('Thank you! Your message has been sent successfully.');
        contactForm.reset();
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFormError(message) {
    const notification = document.createElement('div');
    notification.className = 'form-notification error';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 5px;
        box-shadow: 0 .5rem 1rem rgba(0,0,0,.3);
        z-index: 10000;
        font-size: 1.4rem;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showFormSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'form-notification success';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 5px;
        box-shadow: 0 .5rem 1rem rgba(0,0,0,.3);
        z-index: 10000;
        font-size: 1.4rem;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== ANIMATIONS FOR SCROLL ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe product boxes and review boxes
document.querySelectorAll('.products .box, .review .box, .icon').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// ==================== PRODUCT HOVER EFFECTS ====================
const productBoxes = document.querySelectorAll('.products .box');
productBoxes.forEach(box => {
    box.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
        this.style.boxShadow = '0 1rem 2rem rgba(0,0,0,.2)';
    });
    
    box.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 .5rem 1.5rem rgba(0,0,0,.1)';
    });
});

// ==================== CART MODAL (Optional Feature) ====================
function createCartModal() {
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
        <div class="cart-modal-content">
            <div class="cart-modal-header">
                <h2>Shopping Cart</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="cart-items-container">
                ${renderCartItems()}
            </div>
            <div class="cart-modal-footer">
                <div class="cart-total">
                    <h3>Total: ₱${shoppingCart.getTotal().toFixed(2)}</h3>
                </div>
                <button class="btn checkout-btn">Proceed to Checkout</button>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        display: none;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        animation: fadeIn 0.3s ease;
    `;
    
    const modalContent = modal.querySelector('.cart-modal-content');
    modalContent.style.cssText = `
        background: white;
        margin: 5% auto;
        padding: 2rem;
        width: 90%;
        max-width: 600px;
        border-radius: 10px;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    document.body.appendChild(modal);
    
    // Close modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    return modal;
}

function renderCartItems() {
    if (shoppingCart.items.length === 0) {
        return '<p style="text-align: center; padding: 2rem; color: #999;">Your cart is empty</p>';
    }
    
    return shoppingCart.items.map(item => `
        <div class="cart-item" style="display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid #eee;">
            <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px; margin-right: 1rem;">
            <div style="flex: 1;">
                <h4 style="font-size: 1.6rem; color: #333;">${item.name}</h4>
                <p style="color: #999; font-size: 1.2rem;">${item.flowerCount}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <button class="qty-btn minus" data-name="${item.name}" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; border-radius: 3px; cursor: pointer;">-</button>
                <span style="font-size: 1.4rem; min-width: 20px; text-align: center;">${item.quantity}</span>
                <button class="qty-btn plus" data-name="${item.name}" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; border-radius: 3px; cursor: pointer;">+</button>
            </div>
            <div style="margin-left: 1rem; text-align: right;">
                <p style="font-size: 1.6rem; color: #e84393; font-weight: bold;">₱${(item.price * item.quantity).toFixed(2)}</p>
                <button class="remove-btn" data-name="${item.name}" style="font-size: 1.2rem; color: #ff4444; background: none; border: none; cursor: pointer; margin-top: 0.5rem;">Remove</button>
            </div>
        </div>
    `).join('');
}

// Cart icon click to open modal
const headerCartIcon = document.querySelector('.icons .fa-shopping-cart');
let cartModal;

if (headerCartIcon) {
    headerCartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (!cartModal) {
            cartModal = createCartModal();
        }
        
        // Update cart items
        const container = cartModal.querySelector('.cart-items-container');
        container.innerHTML = renderCartItems();
        
        // Update total
        const total = cartModal.querySelector('.cart-total h3');
        total.textContent = `Total: ₱${shoppingCart.getTotal().toFixed(2)}`;
        
        // Add event listeners to quantity buttons
        cartModal.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productName = e.target.dataset.name;
                const item = shoppingCart.items.find(i => i.name === productName);
                
                if (item) {
                    if (e.target.classList.contains('plus')) {
                        shoppingCart.updateQuantity(productName, item.quantity + 1);
                    } else {
                        shoppingCart.updateQuantity(productName, item.quantity - 1);
                    }
                    
                    // Refresh modal
                    container.innerHTML = renderCartItems();
                    total.textContent = `Total: ₱${shoppingCart.getTotal().toFixed(2)}`;
                    
                    // Re-add event listeners
                    attachCartModalListeners();
                }
            });
        });
        
        // Add event listeners to remove buttons
        cartModal.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productName = e.target.dataset.name;
                shoppingCart.removeItem(productName);
                
                // Refresh modal
                container.innerHTML = renderCartItems();
                total.textContent = `Total: ₱${shoppingCart.getTotal().toFixed(2)}`;
                
                // Re-add event listeners
                attachCartModalListeners();
            });
        });
        
        cartModal.style.display = 'block';
    });
}

function attachCartModalListeners() {
    if (!cartModal) return;
    
    const container = cartModal.querySelector('.cart-items-container');
    const total = cartModal.querySelector('.cart-total h3');
    
    cartModal.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productName = e.target.dataset.name;
            const item = shoppingCart.items.find(i => i.name === productName);
            
            if (item) {
                if (e.target.classList.contains('plus')) {
                    shoppingCart.updateQuantity(productName, item.quantity + 1);
                } else {
                    shoppingCart.updateQuantity(productName, item.quantity - 1);
                }
                
                container.innerHTML = renderCartItems();
                total.textContent = `Total: ₱${shoppingCart.getTotal().toFixed(2)}`;
                attachCartModalListeners();
            }
        });
    });
    
    cartModal.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productName = e.target.dataset.name;
            shoppingCart.removeItem(productName);
            
            container.innerHTML = renderCartItems();
            total.textContent = `Total: ₱${shoppingCart.getTotal().toFixed(2)}`;
            attachCartModalListeners();
        });
    });
}

// ==================== ADD CSS ANIMATIONS ====================
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    .products .box {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .cart-modal-content {
        animation: fadeInUp 0.3s ease;
    }
    
    .cart-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e84393;
        margin-bottom: 2rem;
    }
    
    .cart-modal-header h2 {
        font-size: 2.5rem;
        color: #333;
    }
    
    .close-modal {
        font-size: 3rem;
        cursor: pointer;
        color: #999;
        transition: color 0.3s;
    }
    
    .close-modal:hover {
        color: #e84393;
    }
    
    .cart-modal-footer {
        border-top: 2px solid #eee;
        padding-top: 1.5rem;
        margin-top: 2rem;
    }
    
    .cart-total h3 {
        font-size: 2.2rem;
        color: #333;
        margin-bottom: 1rem;
        text-align: right;
    }
    
    .checkout-btn {
        width: 100%;
        padding: 1.2rem;
        font-size: 1.6rem;
    }
`;
document.head.appendChild(style);

// ==================== INITIALIZE ON PAGE LOAD ====================
window.addEventListener('load', () => {
    console.log('Garden Dreams Shop Initialized!');
    console.log('Cart items:', shoppingCart.getItemCount());
    console.log('Favorites:', favoritesManager.items.length);
});

// ==================== PRODUCT SEARCH (BONUS FEATURE) ====================
function addSearchFunctionality() {
    const navbar = document.querySelector('.navbar');
    const searchHTML = `
        <div class="search-container" style="position: relative; display: inline-block;">
            <input type="text" id="productSearch" placeholder="Search flowers..." 
                style="padding: 0.8rem 1.2rem; border: 1px solid #ddd; border-radius: 5px; font-size: 1.4rem; width: 200px;">
        </div>
    `;
    
    if (navbar && window.innerWidth > 768) {
        navbar.insertAdjacentHTML('beforeend', searchHTML);
        
        const searchInput = document.getElementById('productSearch');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            document.querySelectorAll('.products .box').forEach(box => {
                const productName = box.querySelector('h3').textContent.toLowerCase();
                
                if (productName.includes(searchTerm)) {
                    box.style.display = 'block';
                } else {
                    box.style.display = 'none';
                }
            });
        });
    }
}

// Add search on larger screens
if (window.innerWidth > 768) {
    addSearchFunctionality();
}

console.log('🌸 Garden Dreams Interactive Features Loaded! 🌸');