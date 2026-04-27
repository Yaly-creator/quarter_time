/**
 * Modal de suggestion de formule au moment du checkout.
 * Propose à l'utilisateur de transformer ses pizzas individuelles en formule
 * (pizza+cannette ou 3 pizzas+boisson) avant de partir sur Stripe.
 *
 * API publique :
 *   openFormuleSuggestionModal(plan, pizzasTotal, onAccept, onDecline)
 *     plan : [{ formule: <menu_item>, pizzasToReplace: 1|3 }, ...]
 *     pizzasTotal : prix total des pizzas qui seront remplacées
 *     onAccept() : appelé si l'utilisateur clique "Profiter de l'offre"
 *     onDecline() : appelé si "Non merci, continuer"
 */
(function () {
  var MODAL_ID = 'formule-suggestion-modal';

  function ensureModal() {
    if (document.getElementById(MODAL_ID)) return;

    var modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.style.cssText =
      'display:none;position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.6);' +
      'align-items:center;justify-content:center;padding:16px;';

    modal.innerHTML =
      '<div style="background:#fff;max-width:520px;width:100%;border-radius:10px;' +
        'box-shadow:0 10px 40px rgba(0,0,0,0.3);overflow:hidden;display:flex;flex-direction:column;max-height:90vh;">' +
        '<div style="padding:16px 20px;background:#F96D00;color:#fff;">' +
          '<h4 style="margin:0;font-size:18px;"><i class="fas fa-gift" style="margin-right:8px;"></i>Une offre pour vous !</h4>' +
        '</div>' +
        '<div id="' + MODAL_ID + '-body" style="padding:20px;overflow-y:auto;color:#333;"></div>' +
        '<div style="padding:12px 20px;border-top:1px solid #eee;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">' +
          '<button type="button" id="' + MODAL_ID + '-decline" class="btn btn-secondary">Non merci, continuer</button>' +
          '<button type="button" id="' + MODAL_ID + '-accept" class="btn btn-primary">Profiter de l\'offre</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
  }

  function closeModal() {
    var modal = document.getElementById(MODAL_ID);
    if (modal) modal.style.display = 'none';
  }

  function formatEuro(n) {
    return (Math.round(n * 100) / 100).toFixed(2).replace('.', ',') + ' €';
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function openFormuleSuggestionModal(plan, pizzasTotal, onAccept, onDecline) {
    ensureModal();

    var modal = document.getElementById(MODAL_ID);
    var body = document.getElementById(MODAL_ID + '-body');

    // Récap des formules à appliquer (regroupé par formule)
    var grouped = {};
    plan.forEach(function (entry) {
      var key = entry.formule.id;
      if (!grouped[key]) grouped[key] = { formule: entry.formule, count: 0 };
      grouped[key].count += 1;
    });

    var formulesPriceTotal = plan.reduce(function (sum, e) {
      return sum + parseFloat(e.formule.price);
    }, 0);
    var economie = pizzasTotal - formulesPriceTotal;

    var listHtml = Object.keys(grouped).map(function (k) {
      var g = grouped[k];
      return '<li style="margin-bottom:6px;">' +
        '<strong>' + g.count + '× ' + escapeHtml(g.formule.name) + '</strong> ' +
        '— ' + formatEuro(g.formule.price) + ' / formule' +
      '</li>';
    }).join('');

    var economieHtml = economie > 0.01
      ? '<p style="margin-top:14px;padding:10px 12px;background:#e8f7ec;border-left:4px solid #28a745;border-radius:4px;color:#155724;">' +
          '<i class="fas fa-piggy-bank" style="margin-right:6px;"></i>' +
          '<strong>Économie estimée : ' + formatEuro(economie) + '</strong>' +
        '</p>'
      : '';

    body.innerHTML =
      '<p style="margin-bottom:12px;">En fonction des pizzas dans votre panier, vous pouvez bénéficier d\'une formule plus avantageuse :</p>' +
      '<ul style="padding-left:20px;margin:0;">' + listHtml + '</ul>' +
      economieHtml +
      '<p style="margin-top:14px;font-size:0.92rem;color:#666;">' +
        'Une boisson sera ajoutée automatiquement à chaque formule. Vous pourrez la modifier sur place ou contacter le restaurant.' +
      '</p>';

    var acceptBtn = document.getElementById(MODAL_ID + '-accept');
    var declineBtn = document.getElementById(MODAL_ID + '-decline');

    acceptBtn.onclick = function () {
      closeModal();
      if (typeof onAccept === 'function') onAccept();
    };
    declineBtn.onclick = function () {
      closeModal();
      if (typeof onDecline === 'function') onDecline();
    };

    modal.style.display = 'flex';
  }

  window.openFormuleSuggestionModal = openFormuleSuggestionModal;
})();
