# 🔧 Guide de Débogage du Panier

## Problème Actuel
Le bouton "Ajouter" ne fonctionne pas dans menu.html

## Étapes de Débogage

### Étape 1: Tester la page de test
1. Ouvrez `test_panier.html` dans votre navigateur
2. Cette page affiche:
   - Le statut des fonctions (ShoppingCart, addToCart)
   - Une pizza de test avec un bouton "Ajouter"
   - Une console de débogage intégrée
   - L'état actuel du panier

3. Cliquez sur "Ajouter" et observez:
   - Les messages dans la console de débogage
   - Si l'article s'ajoute au panier
   - Les données dans localStorage

**Si ça fonctionne sur test_panier.html mais pas sur menu.html**, alors le problème vient de la structure HTML ou du chargement des scripts dans menu.html.

### Étape 2: Ouvrir la Console du Navigateur
1. Ouvrez `menu.html` dans votre navigateur
2. Appuyez sur F12 (ou clic droit > Inspecter)
3. Allez dans l'onglet "Console"

### Étape 3: Vérifier les messages de débogage
Quand la page se charge, vous devriez voir:
```
Initialisation des boutons Ajouter au panier...
addToCart est disponible!
Nombre de boutons .btn-primary trouvés: X
Nombre de boutons "Ajouter" configurés: Y
```

Si vous ne voyez PAS ces messages:
- ❌ Le script ne s'exécute pas du tout
- ❌ Problème de chargement de cart.js

### Étape 4: Cliquer sur un bouton "Ajouter"
Vous devriez voir:
```
Bouton Ajouter cliqué!
Conteneur .menus trouvé: [object HTMLDivElement]
Article à ajouter au panier: {id: "...", name: "...", price: ..., ...}
Article ajouté avec succès!
```

Si vous voyez une erreur à la place, notez le message exact.

### Étape 5: Vérifier localStorage
Dans la console, tapez:
```javascript
localStorage.getItem('quarterTimeCart')
```

Vous devriez voir un JSON avec les articles du panier.

## Problèmes Courants et Solutions

### Problème 1: "addToCart n'est pas disponible"
**Cause**: cart.js ne s'est pas chargé correctement

**Solution**:
1. Vérifiez que `js/cart.js` existe
2. Vérifiez qu'il n'y a pas d'erreur JavaScript dans cart.js
3. Vérifiez l'ordre des scripts dans menu.html (cart.js doit être chargé avant le script inline)

### Problème 2: "Impossible de trouver le conteneur du plat"
**Cause**: Le sélecteur `.closest('.menus')` ne trouve pas le conteneur

**Solution**: Vérifiez la structure HTML de la pizza:
```html
<div class="menus ...">
  <div class="menu-img" ...></div>
  <div class="text ...">
    ...
    <a class="btn btn-primary">Ajouter</a>
  </div>
</div>
```

### Problème 3: "Prix invalide"
**Cause**: Le format du prix n'est pas reconnu

**Solution**: Le prix doit être au format "€8,90" ou "€7"

### Problème 4: Erreur réseau 404 pour cart.js
**Cause**: Le fichier cart.js n'est pas au bon endroit

**Solution**:
1. Vérifiez que `js/cart.js` existe
2. Vérifiez le chemin relatif depuis menu.html

### Problème 5: Rien ne se passe, aucun message
**Cause**: Le script ne s'exécute pas

**Solution**:
1. Vérifiez qu'il n'y a pas d'erreur JavaScript ailleurs qui bloque l'exécution
2. Vérifiez dans la console s'il y a des erreurs en rouge

## Vérifications Manuelles

### Vérifier que cart.js se charge
Dans la console du navigateur, tapez:
```javascript
typeof window.addToCart
```
Résultat attendu: `"function"`

### Vérifier que le panier est initialisé
Dans la console, tapez:
```javascript
typeof cart
```
Résultat attendu: `"object"`

### Vérifier le nombre de boutons
Dans la console, tapez:
```javascript
document.querySelectorAll('.btn-primary').length
```
Résultat attendu: Un nombre > 0

### Vérifier les boutons "Ajouter"
Dans la console, tapez:
```javascript
Array.from(document.querySelectorAll('.btn-primary'))
  .filter(btn => btn.textContent.includes('Ajouter')).length
```
Résultat attendu: Le nombre de pizzas (environ 15)

## Test Manuel Direct

Pour tester directement dans la console:
```javascript
// Créer un article de test
const testItem = {
  id: 'test-pizza',
  name: 'Pizza Test',
  price: 10.50,
  description: 'Pizza de test',
  image: 'images/default.jpg'
};

// Ajouter au panier
addToCart(testItem);

// Vérifier
localStorage.getItem('quarterTimeCart');
```

Si cela fonctionne, le problème vient de l'extraction des données depuis le DOM, pas du système de panier lui-même.

## Fichiers Modifiés

1. **menu.html** (lignes ~1293-1400)
   - Script d'ajout au panier avec débogage
   - Vérifie que addToCart est disponible
   - Messages de console détaillés

2. **js/cart.js** (inchangé)
   - Gestion du panier
   - Export de addToCart sur window

3. **test_panier.html** (nouveau)
   - Page de test isolée
   - Console de débogage visuelle

## Prochaines Étapes

1. ✅ Ouvrir test_panier.html et tester
2. ✅ Ouvrir menu.html et vérifier la console
3. ✅ Cliquer sur "Ajouter" et noter les messages
4. ✅ Partager les messages d'erreur si le problème persiste

## Contact / Support

Si le problème persiste après avoir suivi ces étapes:
1. Notez les messages exacts de la console
2. Faites une capture d'écran de la console
3. Indiquez quelle étape ne fonctionne pas
