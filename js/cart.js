/**
 * Gestion du panier pour Quarter Time
 */

// Classe pour gérer le panier
class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.deliveryFee = 0; // Par défaut, à emporter = gratuit
    this.init();
  }

  // Charger le panier depuis localStorage
  loadCart() {
    const savedCart = localStorage.getItem('quarterTimeCart');
    return savedCart ? JSON.parse(savedCart) : [];
  }

  // Sauvegarder le panier dans localStorage
  saveCart() {
    localStorage.setItem('quarterTimeCart', JSON.stringify(this.items));
    this.updateCartCount();
  }

  // Initialiser les événements
  init() {
    this.render();
    this.updateCartCount();
    this.setupEventListeners();
  }

  // Configurer les écouteurs d'événements
  setupEventListeners() {
    // Options de livraison
    const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
    deliveryOptions.forEach(option => {
      option.addEventListener('change', (e) => {
        // Mettre à jour les styles visuels
        document.querySelectorAll('.delivery-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        e.target.closest('.delivery-option').classList.add('selected');

        // Mettre à jour les frais
        this.deliveryFee = e.target.value === 'delivery' ? 3.00 : 0;
        this.updateTotals();
      });
    });

    // Bouton validation
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        this.checkout();
      });
    }
  }

  // Ajouter un article au panier
  addItem(item) {
    const existingItem = this.items.find(i => i.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        ...item,
        quantity: 1
      });
    }

    this.saveCart();
    this.render();
    this.showNotification('Article ajouté au panier !');
  }

  // Retirer un article du panier
  removeItem(itemId) {
    if (confirm('Êtes-vous sûr de vouloir retirer cet article du panier ?')) {
      this.items = this.items.filter(item => item.id !== itemId);
      this.saveCart();
      this.render();
      this.showNotification('Article retiré du panier');
    }
  }

  // Mettre à jour la quantité d'un article
  updateQuantity(itemId, newQuantity) {
    const item = this.items.find(i => i.id === itemId);
    
    if (item) {
      if (newQuantity <= 0) {
        this.removeItem(itemId);
      } else {
        item.quantity = newQuantity;
        this.saveCart();
        this.render();
      }
    }
  }

  // Calculer le sous-total
  getSubtotal() {
    return this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  // Calculer le total
  getTotal() {
    return this.getSubtotal() + this.deliveryFee;
  }

  // Mettre à jour le compteur du panier dans la navbar
  updateCartCount() {
    const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(el => {
      el.textContent = totalItems;
    });
  }

  // Mettre à jour les totaux affichés
  updateTotals() {
    const subtotalEl = document.getElementById('subtotal');
    if (!subtotalEl) return;

    const subtotal = this.getSubtotal();
    const total = this.getTotal();

    subtotalEl.textContent = `${subtotal.toFixed(2)} €`;
    document.getElementById('delivery-fee').textContent = `${this.deliveryFee.toFixed(2)} €`;
    document.getElementById('total').textContent = `${total.toFixed(2)} €`;
  }

  // Afficher le panier
  render() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCart = document.getElementById('empty-cart');
    const cartWithItems = document.getElementById('cart-with-items');

    // Ne rien faire si on n'est pas sur la page panier
    if (!cartItemsContainer || !emptyCart || !cartWithItems) return;

    if (this.items.length === 0) {
      emptyCart.style.display = 'block';
      cartWithItems.style.display = 'none';
      return;
    }

    emptyCart.style.display = 'none';
    cartWithItems.style.display = 'flex';

    // Générer le HTML pour chaque article
    cartItemsContainer.innerHTML = this.items.map(item => `
      <div class="cart-item d-flex align-items-center" data-item-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <h5 class="cart-item-name">${item.name}</h5>
          <p class="cart-item-description">${item.description || ''}</p>
          <span class="cart-item-price">${item.price.toFixed(2)} €</span>
        </div>
        <div class="d-flex flex-column align-items-end">
          <div class="quantity-controls mb-3">
            <button class="quantity-btn decrease-btn" data-item-id="${item.id}">
              <i class="fas fa-minus"></i>
            </button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn increase-btn" data-item-id="${item.id}">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <button class="remove-btn" data-item-id="${item.id}">
            <i class="fas fa-trash"></i> Supprimer
          </button>
          <div class="mt-2">
            <strong>Sous-total: ${(item.price * item.quantity).toFixed(2)} €</strong>
          </div>
        </div>
      </div>
    `).join('');

    // Ajouter les événements aux boutons
    this.attachItemEventListeners();
    
    // Mettre à jour les totaux
    this.updateTotals();
  }

  // Attacher les événements aux boutons des articles
  attachItemEventListeners() {
    // Boutons d'augmentation de quantité
    document.querySelectorAll('.increase-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-item-id');
        const item = this.items.find(i => i.id === itemId);
        if (item) {
          this.updateQuantity(itemId, item.quantity + 1);
        }
      });
    });

    // Boutons de diminution de quantité
    document.querySelectorAll('.decrease-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-item-id');
        const item = this.items.find(i => i.id === itemId);
        if (item) {
          this.updateQuantity(itemId, item.quantity - 1);
        }
      });
    });

    // Boutons de suppression
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.getAttribute('data-item-id');
        this.removeItem(itemId);
      });
    });
  }

  // Valider la commande
  checkout() {
    if (this.items.length === 0) {
      alert('Votre panier est vide !');
      return;
    }

    const deliveryMode = document.querySelector('input[name="delivery"]:checked').value;
    const total = this.getTotal();

    // Pour l'instant, on affiche juste une confirmation
    // Plus tard, cela pourrait rediriger vers une page de paiement
    const message = `
Récapitulatif de votre commande:

Articles: ${this.items.length}
Mode: ${deliveryMode === 'pickup' ? 'À emporter' : 'Livraison'}
Total: ${total.toFixed(2)} €

Votre commande est prête à être validée !
(Cette fonctionnalité sera bientôt disponible)
    `;

    alert(message);

    // TODO: Implémenter l'envoi de la commande au backend
    // Rediriger vers une page de confirmation/paiement
  }

  // Vider le panier
  clearCart() {
    if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      this.items = [];
      this.saveCart();
      this.render();
      this.showNotification('Panier vidé');
    }
  }

  // Afficher une notification
  showNotification(message) {
    // Créer une notification simple
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: #F96D00;
      color: white;
      padding: 15px 25px;
      border-radius: 5px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// Ajouter les animations CSS
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
`;
document.head.appendChild(style);

// Initialiser le panier au chargement de la page
let cart;
document.addEventListener('DOMContentLoaded', () => {
  cart = new ShoppingCart();
});

// Fonction globale pour ajouter un article depuis d'autres pages
function addToCart(item) {
  if (!cart) {
    cart = new ShoppingCart();
  }
  cart.addItem(item);
}

// Exporter pour utilisation globale
window.ShoppingCart = ShoppingCart;
window.addToCart = addToCart;
