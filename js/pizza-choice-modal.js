/**
 * Modal de sélection de pizzas pour les formules (menu midi, 3 pizzas + boisson, etc.)
 * Utilisé par index.html et menu.html. Déclenché quand on clique sur "Ajouter" d'un plat
 * ayant options.pizza_choices > 0.
 *
 * API publique :
 *   window._quarterTimePizzas = [{ name, ... }, ...]   // liste à peupler après chargement du menu
 *   openPizzaChoiceModal(item, pizzaChoices, onConfirm(choices))
 */
(function () {
  var MODAL_ID = 'pizza-choice-modal';

  function ensureModal() {
    if (document.getElementById(MODAL_ID)) return;

    var modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.style.cssText =
      'display:none;position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.6);' +
      'align-items:center;justify-content:center;padding:16px;';

    modal.innerHTML =
      '<div style="background:#fff;max-width:480px;width:100%;border-radius:10px;' +
        'box-shadow:0 10px 40px rgba(0,0,0,0.3);overflow:hidden;display:flex;flex-direction:column;max-height:90vh;">' +
        '<div style="padding:16px 20px;background:#F96D00;color:#fff;display:flex;justify-content:space-between;align-items:center;">' +
          '<h4 id="' + MODAL_ID + '-title" style="margin:0;font-size:18px;">Choisissez vos pizzas</h4>' +
          '<button type="button" id="' + MODAL_ID + '-close" aria-label="Fermer" style="background:transparent;border:0;color:#fff;font-size:26px;line-height:1;cursor:pointer;">&times;</button>' +
        '</div>' +
        '<div id="' + MODAL_ID + '-body" style="padding:20px;overflow-y:auto;"></div>' +
        '<div style="padding:12px 20px;border-top:1px solid #eee;display:flex;gap:8px;justify-content:flex-end;">' +
          '<button type="button" id="' + MODAL_ID + '-cancel" class="btn btn-secondary">Annuler</button>' +
          '<button type="button" id="' + MODAL_ID + '-confirm" class="btn btn-primary">Ajouter au panier</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    document.getElementById(MODAL_ID + '-close').addEventListener('click', closeModal);
    document.getElementById(MODAL_ID + '-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }

  function closeModal() {
    var modal = document.getElementById(MODAL_ID);
    if (modal) modal.style.display = 'none';
  }

  function openPizzaChoiceModal(item, pizzaChoicesCount, onConfirm) {
    ensureModal();

    var pizzas = (window._quarterTimePizzas || []).filter(function (p) {
      return p && p.name;
    });

    if (pizzas.length === 0) {
      alert('Aucune pizza disponible pour le moment.');
      return;
    }

    var modal = document.getElementById(MODAL_ID);
    var body = document.getElementById(MODAL_ID + '-body');
    var title = document.getElementById(MODAL_ID + '-title');

    title.textContent = item.name + ' — choisissez ' +
      pizzaChoicesCount + ' pizza' + (pizzaChoicesCount > 1 ? 's' : '');

    var optionsHtml = pizzas.map(function (p) {
      return '<option value="' + escapeAttr(p.name) + '">' + escapeHtml(p.name) + '</option>';
    }).join('');

    var selectsHtml = '';
    for (var i = 1; i <= pizzaChoicesCount; i++) {
      selectsHtml +=
        '<div style="margin-bottom:12px;">' +
          '<label style="display:block;margin-bottom:4px;font-weight:600;color:#333;">Pizza ' + i + '</label>' +
          '<select class="form-control pizza-choice-select" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;">' +
            optionsHtml +
          '</select>' +
        '</div>';
    }

    body.innerHTML = selectsHtml;
    modal.style.display = 'flex';

    var confirmBtn = document.getElementById(MODAL_ID + '-confirm');
    confirmBtn.onclick = function () {
      var selects = body.querySelectorAll('.pizza-choice-select');
      var choices = Array.prototype.map.call(selects, function (s) { return s.value; });
      closeModal();
      onConfirm(choices);
    };
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function escapeAttr(s) { return escapeHtml(s); }

  window.openPizzaChoiceModal = openPizzaChoiceModal;
})();
