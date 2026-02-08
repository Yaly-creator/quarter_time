# Documentation du Système de Panier - Quarter Time

## 📦 Vue d'ensemble

Le système de panier permet aux utilisateurs d'ajouter des articles depuis les pages menu et index, de gérer leur commande, et de passer à la validation.

## 🗂️ Fichiers créés

### 1. `panier.html`
Page principale du panier avec :
- Affichage des articles ajoutés
- Gestion des quantités (augmenter/diminuer)
- Suppression d'articles
- Calcul automatique des totaux
- Options de livraison (à emporter / livraison)
- Bouton de validation de commande
- État "panier vide" avec CTA vers le menu

### 2. `js/cart.js`
Logique JavaScript complète incluant :
- Classe `ShoppingCart` pour gérer toutes les opérations
- Sauvegarde automatique dans `localStorage`
- Mise à jour du compteur de panier dans la navbar
- Gestion des quantités
- Calcul des totaux (sous-total + frais de livraison)
- Notifications visuelles
- Fonction globale `addToCart()` pour ajouter des articles

### 3. Mises à jour des pages existantes
- `index.html` : Lien panier + script d'ajout au panier
- `menu.html` : Lien panier + script d'ajout au panier

## 🎨 Design et Style

### Couleurs
- **Primary Orange**: `#F96D00` (couleur principale Quarter Time)
- **Backgrounds**: Blanc pour les cartes, `#f8f9fa` pour la page
- **Texte**: Hiérarchie avec `#333` pour titres, `#666` pour descriptions

### Responsive
- **Desktop** (>768px): Layout en 2 colonnes (articles à gauche, récapitulatif à droite)
- **Mobile** (<768px): Layout empilé verticalement
- Images adaptatives (120x120px desktop, 100% width mobile)

### Animations
- Hover sur les cartes d'articles
- Notifications slide-in/slide-out
- Transitions douces sur les boutons

## 🔧 Fonctionnalités

### Ajout au panier
```javascript
// Depuis n'importe quelle page
addToCart({
  id: 'pizza-margharita',
  name: 'Pizza Margharita',
  price: 7.00,
  description: 'Base Tomate',
  image: 'images/pizza.jpg'
});
```

### Gestion des quantités
- **Augmenter** : Bouton `+`
- **Diminuer** : Bouton `-` (supprime l'article si quantité = 0)
- **Supprimer** : Bouton poubelle avec confirmation

### Options de livraison
- **À emporter** : Gratuit (par défaut)
- **Livraison** : +3,00 € (modifiable dans le code)

### Persistance
Le panier est sauvegardé automatiquement dans `localStorage` et persiste :
- Entre les pages
- Après fermeture du navigateur
- Jusqu'à validation ou suppression manuelle

## 📱 Navigation

Le compteur de panier dans la navbar est mis à jour automatiquement :
```html
<span class="badge badge-warning" id="cart-count">0</span>
```

## 🚀 Utilisation

### Pour l'utilisateur
1. **Parcourir le menu** sur `index.html` ou `menu.html`
2. **Cliquer sur "Commander"** sur un plat
3. **Voir la notification** confirmant l'ajout
4. **Cliquer sur l'icône panier** dans la navbar
5. **Gérer les quantités** si nécessaire
6. **Choisir le mode** (à emporter / livraison)
7. **Valider la commande**

### Pour le développeur

#### Ajouter le panier à une nouvelle page
```html
<!-- Dans le <head> ou avant </body> -->
<script src="js/cart.js"></script>

<!-- Mettre à jour le lien du panier dans la navbar -->
<a href="panier.html" class="nav-link">
  <i class="fas fa-shopping-cart"></i> Panier
  <span class="badge badge-warning" id="cart-count">0</span>
</a>
```

#### Personnaliser les boutons "Commander"
```javascript
document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    addToCart({
      id: 'produit-unique-id',
      name: 'Nom du produit',
      price: 9.90,
      description: 'Description courte',
      image: 'chemin/vers/image.jpg'
    });
  });
});
```

## 🔄 Prochaines étapes possibles

### Backend / Base de données
- [ ] Intégration avec Supabase pour sauvegarder les commandes
- [ ] Système d'authentification utilisateur
- [ ] Historique des commandes

### Paiement
- [ ] Intégration Stripe ou PayPal
- [ ] Page de checkout avec formulaire de paiement
- [ ] Confirmation de commande par email

### Fonctionnalités avancées
- [ ] Codes promo / réductions
- [ ] Programme de fidélité
- [ ] Suivi de commande en temps réel
- [ ] Options de personnalisation des plats
- [ ] Favoris / commandes récurrentes

### UX améliorée
- [ ] Animation d'ajout au panier plus élaborée
- [ ] Panier en modal/sidebar sans quitter la page
- [ ] Recommandations de produits
- [ ] Indication de plats populaires

## 🐛 Debugging

### Le compteur ne se met pas à jour
Vérifier que `cart.js` est bien chargé sur toutes les pages :
```html
<script src="js/cart.js"></script>
```

### Les articles ne s'affichent pas
1. Vérifier la console JavaScript (F12)
2. Vérifier que `localStorage` n'est pas désactivé
3. Effacer le localStorage : `localStorage.removeItem('quarterTimeCart')`

### Les images ne s'affichent pas
Vérifier les chemins d'images dans les données du panier. Le script extrait automatiquement les images depuis les `background-image` CSS.

## 📝 Structure des données

### Format d'un article dans le panier
```javascript
{
  id: 'pizza-margharita',           // Identifiant unique
  name: 'Pizza Margharita',         // Nom affiché
  price: 7.00,                      // Prix unitaire en euros
  description: 'Base Tomate',       // Description courte
  image: 'images/pizza.jpg',        // Chemin vers l'image
  quantity: 2                       // Quantité (géré automatiquement)
}
```

### LocalStorage
Clé : `quarterTimeCart`
Valeur : Array JSON d'articles

## 🎯 Objectifs atteints

✅ Page panier fonctionnelle et responsive
✅ Ajout/suppression d'articles
✅ Gestion des quantités
✅ Calcul automatique des totaux
✅ Persistance des données
✅ Intégration avec le design existant
✅ Notifications utilisateur
✅ Options de livraison
✅ État "panier vide"

## 📞 Support

Pour toute question ou amélioration, référez-vous à cette documentation ou contactez l'équipe de développement.
