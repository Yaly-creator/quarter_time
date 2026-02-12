/**
 * Gestion de l'authentification pour Quarter Time
 * Vérifie la session Supabase et affiche Connexion ou Se déconnecter dans la navbar
 */

(function() {
  var SUPABASE_URL = 'https://ljbghtwstlwtqrwrzcat.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYmdodHdzdGx3dHFyd3J6Y2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDYyOTcsImV4cCI6MjA4NTI4MjI5N30.ITL_iy5w2ppxvm2yMQaJ68gbBNm272wkK2wFc6m-k5M';

  var supabaseClient;
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('Auth: Supabase non disponible', err);
    return;
  }

  // Exposer le client pour les pages qui en ont besoin (connexion, inscription)
  window.supabaseClient = supabaseClient;

  // Vérifier la session et mettre à jour la navbar
  supabaseClient.auth.getSession().then(function(result) {
    var session = result.data.session;
    var navConnexion = document.getElementById('nav-connexion');
    var navLogout = document.getElementById('nav-logout');
    var navOrders = document.getElementById('nav-orders');

    if (!navConnexion || !navLogout) return;

    if (session) {
      navConnexion.style.display = 'none';
      navLogout.style.display = '';
      if (navOrders) navOrders.style.display = '';
    } else {
      navConnexion.style.display = '';
      navLogout.style.display = 'none';
      if (navOrders) navOrders.style.display = 'none';
    }
  });

  // Créer la modale de confirmation de déconnexion
  var modalHTML = '<div class="modal fade" id="logoutModal" tabindex="-1" role="dialog" aria-labelledby="logoutModalLabel" aria-hidden="true">'
    + '<div class="modal-dialog modal-dialog-centered" role="document">'
    + '<div class="modal-content" style="border-radius:10px;">'
    + '<div class="modal-header" style="border-bottom:1px solid #dee2e6;">'
    + '<h5 class="modal-title" id="logoutModalLabel">Déconnexion</h5>'
    + '<button type="button" class="close" data-dismiss="modal" aria-label="Fermer"><span aria-hidden="true">&times;</span></button>'
    + '</div>'
    + '<div class="modal-body text-center" style="padding:2rem 1rem;">'
    + '<p style="font-size:1.1rem;margin-bottom:0;">Êtes-vous sûr de vouloir vous déconnecter ?</p>'
    + '</div>'
    + '<div class="modal-footer" style="border-top:1px solid #dee2e6;justify-content:center;">'
    + '<button type="button" class="btn btn-secondary" data-dismiss="modal">Non</button>'
    + '<button type="button" class="btn btn-primary" id="logout-confirm">Oui</button>'
    + '</div>'
    + '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Gérer le clic sur Se déconnecter — afficher la modale
  var logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      $('#logoutModal').modal('show');
    });
  }

  // Confirmer la déconnexion
  document.getElementById('logout-confirm').addEventListener('click', async function() {
    try {
      await supabaseClient.auth.signOut();
    } catch (err) {
      console.error('Erreur déconnexion:', err);
    }
    window.location.href = 'connexion.html';
  });
})();
