/**
 * Gestion de l'historique des commandes pour Quarter Time
 */

(function() {
  'use strict';

  var STATUS_LABELS = {
    'paid': 'Payée',
    'preparing': 'En préparation',
    'ready': 'Prête',
    'completed': 'Terminée',
    'cancelled': 'Annulée'
  };

  var STATUS_CLASSES = {
    'paid': 'status-paid',
    'preparing': 'status-preparing',
    'ready': 'status-ready',
    'completed': 'status-completed',
    'cancelled': 'status-completed'
  };

  function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function renderOrderCard(order) {
    var items = order.items || [];
    var orderDate = formatDate(order.created_at);
    var statusLabel = STATUS_LABELS[order.status] || order.status;
    var statusClass = STATUS_CLASSES[order.status] || 'status-paid';
    var shortId = order.id.substring(0, 8).toUpperCase();

    var itemsHtml = items.map(function(item) {
      var lineTotal = (item.price * item.quantity).toFixed(2);
      return '<li>'
        + '<span class="item-name">' + item.name
        + ' <span class="item-qty">x' + item.quantity + '</span></span>'
        + '<span class="item-price">' + lineTotal + ' &euro;</span>'
        + '</li>';
    }).join('');

    var deliveryLabel = order.delivery_mode === 'delivery'
      ? '<i class="fas fa-truck"></i> Livraison'
      : '<i class="fas fa-store"></i> À emporter';

    return '<div class="order-card">'
      + '<div class="order-header">'
      + '  <div>'
      + '    <span class="order-number">Commande #' + shortId + '</span><br>'
      + '    <span class="order-date"><i class="far fa-calendar-alt"></i> ' + orderDate + '</span>'
      + '  </div>'
      + '  <span class="order-status ' + statusClass + '">' + statusLabel + '</span>'
      + '</div>'
      + '<ul class="order-items-list">' + itemsHtml + '</ul>'
      + '<div class="order-footer">'
      + '  <span class="order-delivery-mode">' + deliveryLabel + '</span>'
      + '  <span class="order-total">Total : ' + parseFloat(order.total).toFixed(2) + ' &euro;</span>'
      + '</div>'
      + '</div>';
  }

  async function loadOrderHistory() {
    var authRequired = document.getElementById('auth-required');
    var loadingEl = document.getElementById('orders-loading');
    var emptyEl = document.getElementById('empty-orders');
    var containerEl = document.getElementById('orders-container');
    var listEl = document.getElementById('orders-list');

    if (!authRequired || !loadingEl || !containerEl) return;

    if (!window.supabaseClient) {
      authRequired.style.display = 'block';
      return;
    }

    try {
      var result = await window.supabaseClient.auth.getSession();
      var session = result.data.session;

      if (!session) {
        authRequired.style.display = 'block';
        return;
      }

      loadingEl.style.display = 'block';

      var response = await window.supabaseClient
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      loadingEl.style.display = 'none';

      if (response.error) {
        console.error('Erreur chargement commandes:', response.error);
        emptyEl.style.display = 'block';
        emptyEl.querySelector('h3').textContent = 'Erreur de chargement';
        emptyEl.querySelector('p').textContent = 'Impossible de charger vos commandes. Veuillez réessayer.';
        return;
      }

      var orders = response.data;

      if (!orders || orders.length === 0) {
        emptyEl.style.display = 'block';
        return;
      }

      var html = orders.map(renderOrderCard).join('');
      listEl.innerHTML = html;
      containerEl.style.display = 'block';

    } catch (err) {
      console.error('Erreur historique commandes:', err);
      loadingEl.style.display = 'none';
      emptyEl.style.display = 'block';
      emptyEl.querySelector('h3').textContent = 'Erreur de chargement';
      emptyEl.querySelector('p').textContent = 'Impossible de charger vos commandes. Veuillez réessayer.';
    }
  }

  document.addEventListener('DOMContentLoaded', loadOrderHistory);
})();
