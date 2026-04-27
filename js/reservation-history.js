/**
 * Gestion de l'historique des réservations pour Quarter Time
 */

(function () {
  'use strict';

  var STATUS_LABELS = {
    'confirmed': 'Confirmée',
    'pending': 'En attente',
    'cancelled': 'Annulée',
    'completed': 'Terminée'
  };

  var STATUS_CLASSES = {
    'confirmed': 'status-paid',
    'pending': 'status-preparing',
    'cancelled': 'status-completed',
    'completed': 'status-completed'
  };

  var EVENT_LABELS = {
    'standard': null,
    'anniversaire': 'Anniversaire',
    'affaires': 'Repas d\'affaires',
    'romantique': 'Dîner romantique',
    'famille': 'Repas de famille',
    'groupe': 'Groupe'
  };

  function escapeHtml(s) {
    return s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '';
  }

  function formatReservationDateTime(reservedAt) {
    var d = new Date(reservedAt);
    var datePart = d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    var hh = String(d.getHours()).padStart(2, '0');
    var mm = String(d.getMinutes()).padStart(2, '0');
    return datePart + ' à ' + hh + 'h' + mm;
  }

  function renderReservationCard(r) {
    var statusLabel = STATUS_LABELS[r.status] || r.status;
    var statusClass = STATUS_CLASSES[r.status] || 'status-paid';
    var dateTimeLabel = formatReservationDateTime(r.reserved_at);
    var eventLabel = EVENT_LABELS[r.event_type || 'standard'];

    var notesHtml = r.notes && r.notes.trim().length
      ? '<div class="reservation-notes"><i class="fas fa-comment-dots"></i> ' + escapeHtml(r.notes) + '</div>'
      : '';

    var eventHtml = eventLabel
      ? '<div class="reservation-event"><i class="fas fa-star"></i> ' + escapeHtml(eventLabel) + '</div>'
      : '';

    return '<div class="order-card">'
      + '<div class="order-header">'
      + '  <div>'
      + '    <span class="order-number"><i class="far fa-calendar-alt" style="color:#F96D00;margin-right:6px;"></i>' + escapeHtml(dateTimeLabel) + '</span>'
      + '  </div>'
      + '  <span class="order-status ' + statusClass + '">' + statusLabel + '</span>'
      + '</div>'
      + '<div class="reservation-body">'
      + '  <div class="reservation-info"><i class="fas fa-users"></i> <strong>' + r.guests + '</strong> personne' + (r.guests > 1 ? 's' : '') + '</div>'
      + eventHtml
      + notesHtml
      + '</div>'
      + '<div class="order-footer">'
      + '  <span class="reservation-customer"><i class="fas fa-user"></i> ' + escapeHtml(r.customer_name) + '</span>'
      + '  <span class="reservation-phone"><i class="fas fa-phone"></i> ' + escapeHtml(r.customer_phone) + '</span>'
      + '</div>'
      + '</div>';
  }

  async function loadReservationHistory() {
    var authRequired = document.getElementById('auth-required');
    var loadingEl = document.getElementById('reservations-loading');
    var emptyEl = document.getElementById('empty-reservations');
    var containerEl = document.getElementById('reservations-container');
    var upcomingSection = document.getElementById('reservations-upcoming-section');
    var pastSection = document.getElementById('reservations-past-section');
    var upcomingList = document.getElementById('reservations-upcoming');
    var pastList = document.getElementById('reservations-past');
    var emailHintEl = document.getElementById('reservations-email-hint');

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

      if (emailHintEl && session.user && session.user.email) {
        emailHintEl.textContent = session.user.email;
      }

      loadingEl.style.display = 'block';

      console.log('[reservations] email compte:', session.user && session.user.email);

      var response = await window.supabaseClient
        .from('reservations')
        .select('*')
        .order('reserved_at', { ascending: false });

      console.log('[reservations] résultat RLS:', response.data && response.data.length, 'ligne(s)');

      loadingEl.style.display = 'none';

      if (response.error) {
        console.error('Erreur chargement réservations:', response.error);
        emptyEl.style.display = 'block';
        emptyEl.querySelector('h3').textContent = 'Erreur de chargement';
        emptyEl.querySelector('p').textContent = 'Impossible de charger vos réservations. Veuillez réessayer.';
        return;
      }

      var reservations = response.data || [];

      if (reservations.length === 0) {
        emptyEl.style.display = 'block';
        return;
      }

      var now = Date.now();
      var upcoming = [];
      var past = [];
      reservations.forEach(function (r) {
        var t = new Date(r.reserved_at).getTime();
        if (t >= now && r.status !== 'cancelled') {
          upcoming.push(r);
        } else {
          past.push(r);
        }
      });

      // upcoming : plus proche en premier
      upcoming.sort(function (a, b) {
        return new Date(a.reserved_at) - new Date(b.reserved_at);
      });

      containerEl.style.display = 'block';

      if (upcoming.length > 0) {
        upcomingList.innerHTML = upcoming.map(renderReservationCard).join('');
        upcomingSection.style.display = 'block';
      } else {
        upcomingSection.style.display = 'none';
      }

      if (past.length > 0) {
        pastList.innerHTML = past.map(renderReservationCard).join('');
        pastSection.style.display = 'block';
      } else {
        pastSection.style.display = 'none';
      }

    } catch (err) {
      console.error('Erreur historique réservations:', err);
      loadingEl.style.display = 'none';
      emptyEl.style.display = 'block';
      emptyEl.querySelector('h3').textContent = 'Erreur de chargement';
      emptyEl.querySelector('p').textContent = 'Impossible de charger vos réservations. Veuillez réessayer.';
    }
  }

  document.addEventListener('DOMContentLoaded', loadReservationHistory);
})();
