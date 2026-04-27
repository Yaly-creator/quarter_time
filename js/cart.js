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
    const deliveryFeeEl = document.getElementById('delivery-fee');
    if (deliveryFeeEl) deliveryFeeEl.textContent = `${this.deliveryFee.toFixed(2)} €`;
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
          ${item.choices && item.choices.length ? `<ul class="cart-item-choices" style="margin:4px 0;padding-left:18px;font-size:14px;color:#555;">${item.choices.map((c, i) => `<li>Pizza ${i + 1} : <strong>${c}</strong></li>`).join('')}</ul>` : ''}
          ${item.prepTime ? `<p class="prep-time"><i class="far fa-clock"></i> <strong>Temps de préparation : ${item.prepTime} min</strong></p>` : ''}
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

  // Compter le nombre total de pizzas individuelles dans le panier
  countPizzas() {
    return this.items.reduce(function (sum, it) {
      return sum + (it.isPizza ? it.quantity : 0);
    }, 0);
  }

  // Construire la liste \u00e0 plat (1 entr\u00e9e par unit\u00e9 de pizza) dans l'ordre du panier
  getPizzaSlots() {
    var slots = [];
    this.items.forEach(function (it) {
      if (!it.isPizza) return;
      for (var i = 0; i < it.quantity; i++) {
        slots.push({ id: it.id, name: it.name, price: parseFloat(it.price) });
      }
    });
    return slots;
  }

  // D\u00e9cr\u00e9menter N pizzas du panier en suivant l'ordre des slots fournis
  decrementPizzasBySlots(slotsToRemove) {
    var self = this;
    slotsToRemove.forEach(function (slot) {
      var item = self.items.find(function (i) { return i.id === slot.id && i.isPizza; });
      if (!item) return;
      item.quantity -= 1;
      if (item.quantity <= 0) {
        self.items = self.items.filter(function (i) { return i !== item; });
      }
    });
    this.saveCart();
  }

  // Construire le plan de formules \u00e0 proposer en fonction du nombre de pizzas
  planFormulesForPizzaCount(count) {
    var formules = (window._quarterTimeFormules || []).filter(function (f) {
      return f && f.available !== false && f.orderable_online !== false;
    });
    if (formules.length === 0 || count <= 0) return [];

    function findFormule3p() {
      return formules.find(function (f) {
        var pc = f.options && f.options.pizza_choices ? parseInt(f.options.pizza_choices) : 0;
        return pc === 3;
      });
    }
    function findFormulePizzaCannette() {
      return formules.find(function (f) {
        var n = (f.name || '').toLowerCase();
        var pc = f.options && f.options.pizza_choices ? parseInt(f.options.pizza_choices) : 0;
        return n.indexOf('pizza') !== -1
          && (n.indexOf('cannette') !== -1 || n.indexOf('canette') !== -1)
          && pc <= 1;
      });
    }

    var plan = [];
    if (count >= 3) {
      var f3 = findFormule3p();
      if (f3) {
        var nbPacks = Math.floor(count / 3);
        for (var i = 0; i < nbPacks; i++) {
          plan.push({ formule: f3, pizzasToReplace: 3 });
        }
      }
    } else {
      // 1 ou 2 pizzas \u2192 proposer la formule pizza+cannette sur 1 pizza
      var fPC = findFormulePizzaCannette();
      if (fPC) {
        plan.push({ formule: fPC, pizzasToReplace: 1 });
      }
    }
    return plan;
  }

  // Trouver la boisson par d\u00e9faut (1\u00e8re disponible)
  getDefaultBoisson() {
    var boissons = (window._quarterTimeBoissons || []).filter(function (b) {
      return b && b.available !== false && b.orderable_online !== false;
    });
    return boissons.length > 0 ? boissons[0] : null;
  }

  // Appliquer le plan : retirer les pizzas concern\u00e9es, ajouter les lignes formule
  applyFormulePlan(plan) {
    var slots = this.getPizzaSlots();
    var defaultBoisson = this.getDefaultBoisson();
    var slotIndex = 0;

    for (var i = 0; i < plan.length; i++) {
      var entry = plan[i];
      var n = entry.pizzasToReplace;
      var taken = slots.slice(slotIndex, slotIndex + n);
      slotIndex += n;
      if (taken.length < n) break; // s\u00e9curit\u00e9

      var choices = taken.map(function (s) { return s.name; });
      if (defaultBoisson) choices.push(defaultBoisson.name);

      this.decrementPizzasBySlots(taken);

      var formule = entry.formule;
      var newItem = {
        id: String(formule.id) + '-formule-' + Date.now() + '-' + i,
        name: formule.name,
        price: parseFloat(formule.price),
        description: formule.description || '',
        image: formule.image_url || 'images/default.jpg',
        prepTime: formule.prep_time || null,
        choices: choices,
        isPizza: false,
        quantity: 1
      };
      this.items.push(newItem);
    }

    this.saveCart();
    this.render();
  }

  // Demander \u00e0 l'utilisateur s'il veut profiter d'une formule plus avantageuse.
  // Resolve sans rien faire si aucune formule applicable ou si l'utilisateur refuse.
  maybeSuggestFormule() {
    var self = this;
    return new Promise(function (resolve) {
      if (typeof window.openFormuleSuggestionModal !== 'function') {
        return resolve();
      }
      var count = self.countPizzas();
      var plan = self.planFormulesForPizzaCount(count);
      if (plan.length === 0) return resolve();

      var slots = self.getPizzaSlots();
      var totalSlotsUsed = plan.reduce(function (s, e) { return s + e.pizzasToReplace; }, 0);
      var pizzasTotal = slots.slice(0, totalSlotsUsed).reduce(function (s, sl) {
        return s + sl.price;
      }, 0);

      window.openFormuleSuggestionModal(plan, pizzasTotal, function onAccept() {
        self.applyFormulePlan(plan);
        resolve();
      }, function onDecline() {
        resolve();
      });
    });
  }

  // Valider la commande - Redirection vers Stripe Checkout
  async checkout() {
    if (window._ordersDisabled) {
      alert('Les commandes sont actuellement ferm\u00e9es. Veuillez r\u00e9essayer plus tard.');
      return;
    }

    if (this.items.length === 0) {
      alert('Votre panier est vide !');
      return;
    }

    // Sugg\u00e9rer une formule plus avantageuse si applicable (avant la session check)
    await this.maybeSuggestFormule();

    if (this.items.length === 0) {
      alert('Votre panier est vide !');
      return;
    }

    // V\u00e9rifier que le client est connect\u00e9 (obligatoire pour commander)
    if (window.supabaseClient) {
      try {
        const sess = await window.supabaseClient.auth.getSession();
        if (!sess.data.session) {
          alert('Vous devez \u00eatre connect\u00e9 pour passer une commande. Vous allez \u00eatre redirig\u00e9 vers la page de connexion.');
          localStorage.setItem('quarterTimeRedirectAfterLogin', 'panier.html');
          window.location.href = 'connexion.html';
          return;
        }
      } catch (e) {
        console.error('Erreur v\u00e9rification session:', e);
        alert('Impossible de v\u00e9rifier votre session. Veuillez r\u00e9essayer.');
        return;
      }
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    const deliveryMode = document.querySelector('input[name="delivery"]:checked').value;

    // Valider le nom du client (obligatoire)
    const nameInput = document.getElementById('customer-name-input');
    const customerName = nameInput ? nameInput.value.trim() : '';
    if (!customerName) {
      alert('Veuillez indiquer votre nom pour valider la commande.');
      if (nameInput) {
        nameInput.focus();
        nameInput.classList.add('is-invalid');
        nameInput.addEventListener('input', function once() {
          nameInput.classList.remove('is-invalid');
          nameInput.removeEventListener('input', once);
        });
      }
      return;
    }

    // Désactiver le bouton pendant le chargement
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.innerHTML = '<span class="spinner-border spinner-border-sm mr-2"></span>Redirection vers le paiement...';
    }

    // Sauvegarder le mode de livraison et le nom avant la redirection Stripe
    localStorage.setItem('quarterTimeDeliveryMode', deliveryMode);
    localStorage.setItem('quarterTimeCustomerName', customerName);

    try {
      const SUPABASE_URL = 'https://ljbghtwstlwtqrwrzcat.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYmdodHdzdGx3dHFyd3J6Y2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDYyOTcsImV4cCI6MjA4NTI4MjI5N30.ITL_iy5w2ppxvm2yMQaJ68gbBNm272wkK2wFc6m-k5M';

      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          items: this.items,
          deliveryMode: deliveryMode,
          origin: window.location.origin,
        }),
      });

      const data = await response.json();

      if (data.ok && data.url) {
        // Rediriger vers la page de paiement Stripe
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erreur lors de la création du paiement');
      }
    } catch (error) {
      console.error('Erreur checkout:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');

      // Réactiver le bouton
      if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Valider la commande';
      }
    }
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

  // Afficher une notification persistante avec lien "Voir mon panier" clignotant
  showNotification(message) {
    // Réutiliser le bandeau existant s'il est déjà affiché
    var existing = document.getElementById('cart-notification-banner');
    if (existing) {
      var msgEl = existing.querySelector('.cart-notification-message');
      if (msgEl) msgEl.textContent = message;
      return;
    }

    var notification = document.createElement('div');
    notification.id = 'cart-notification-banner';
    notification.className = 'cart-notification-banner';
    notification.innerHTML =
      '<span class="cart-notification-message"></span>' +
      '<a href="panier.html" class="cart-notification-link">Voir mon panier</a>' +
      '<button type="button" class="cart-notification-close" aria-label="Fermer">&times;</button>';

    notification.querySelector('.cart-notification-message').textContent = message;
    notification.querySelector('.cart-notification-close').addEventListener('click', function () {
      notification.remove();
    });

    // Sur la page panier elle-même, pas besoin d'afficher le lien "Voir mon panier"
    if (/panier\.html$/i.test(window.location.pathname)) {
      var link = notification.querySelector('.cart-notification-link');
      if (link) link.style.display = 'none';
    }

    document.body.appendChild(notification);
  }
}

// Styles du bandeau de notification panier (persistant, lien clignotant)
const style = document.createElement('style');
style.textContent = `
  .cart-notification-banner {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: #F96D00;
    color: #fff;
    padding: 14px 18px;
    box-shadow: 0 -4px 12px rgba(0,0,0,0.25);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    flex-wrap: wrap;
    font-family: Poppins, sans-serif;
    font-size: 0.95rem;
    animation: cartBannerSlideUp 0.3s ease;
  }
  .cart-notification-message {
    font-weight: 500;
  }
  .cart-notification-link {
    background: #fff;
    color: #F96D00;
    padding: 8px 18px;
    border-radius: 25px;
    font-weight: 700;
    text-decoration: none;
    animation: cartLinkBlink 1s ease-in-out infinite;
  }
  .cart-notification-link:hover {
    text-decoration: none;
    color: #F96D00;
    background: #fff5e8;
  }
  .cart-notification-close {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: 0;
    color: #fff;
    font-size: 26px;
    line-height: 1;
    cursor: pointer;
    padding: 4px 8px;
  }
  @keyframes cartBannerSlideUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes cartLinkBlink {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.55; transform: scale(0.96); }
  }
  @media (max-width: 576px) {
    .cart-notification-banner {
      padding: 12px 36px 12px 14px;
      font-size: 0.9rem;
    }
    .cart-notification-link {
      padding: 7px 14px;
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
