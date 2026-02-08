# Documentation - Validation du Champ Date de Réservation

## 📋 Vue d'ensemble

Cette documentation explique l'implémentation de la validation du champ de date pour le formulaire de réservation du restaurant Quarter Time, qui bloque les dates passées et les dimanches (jour de fermeture).

---

## 🎯 Contraintes Implémentées

✅ **Pas de dates antérieures à aujourd'hui** : L'attribut `min` est automatiquement défini à la date du jour  
✅ **Dimanches désactivés** : Validation JavaScript qui détecte et refuse les dimanches  
✅ **Message d'erreur clair** : Affichage d'un message visible + alerte navigateur  
✅ **Code vanilla JavaScript** : Aucune dépendance externe, compatible tous navigateurs modernes  
✅ **Champ natif HTML5** : Utilisation de `<input type="date">` pour une meilleure UX mobile

---

## 📝 Code HTML

### Structure du champ date

```html
<div class="col-md-6">
  <div class="form-group">
    <label for="book_date_reservation">Date</label>
    <input type="date" class="form-control" id="book_date_reservation" name="date" required>
    <small id="date-error-message" class="form-text text-danger" style="display: none; font-weight: bold;"></small>
  </div>
</div>
```

**Éléments clés :**
- `type="date"` : Champ natif HTML5 avec calendrier intégré
- `id="date-error-message"` : Conteneur pour le message d'erreur
- `required` : Validation HTML5 native

---

## 💻 Code JavaScript

### 1. Fonction d'initialisation principale

```javascript
function initializeDateField(dateInputId, errorMessageId) {
    const dateInput = document.getElementById(dateInputId);
    const errorMessage = document.getElementById(errorMessageId);
    
    if (!dateInput) return;
    
    // 1. Définir la date minimum à aujourd'hui
    const today = new Date();
    const todayString = formatDateToYYYYMMDD(today);
    dateInput.setAttribute('min', todayString);
    
    // 2. Valider la sélection de date (bloquer les dimanches)
    dateInput.addEventListener('change', function() {
        const selectedDate = new Date(this.value + 'T00:00:00');
        const dayOfWeek = selectedDate.getDay(); // 0 = Dimanche
        
        if (dayOfWeek === 0) {
            // Afficher le message d'erreur
            if (errorMessage) {
                errorMessage.textContent = '⚠️ Le restaurant est fermé le dimanche. Veuillez choisir une autre date.';
                errorMessage.style.display = 'block';
            }
            
            // Vider le champ
            this.value = '';
            
            // Ajouter une classe d'erreur visuelle
            this.classList.add('is-invalid');
            
            // Afficher une alerte
            setTimeout(() => {
                alert('⚠️ Le restaurant est fermé le dimanche.\nVeuillez sélectionner une autre date.');
            }, 100);
        } else {
            // Masquer le message d'erreur si la date est valide
            if (errorMessage) {
                errorMessage.style.display = 'none';
            }
            this.classList.remove('is-invalid');
        }
    });
    
    // 3. Valider aussi lors de la saisie manuelle
    dateInput.addEventListener('blur', function() {
        if (this.value) {
            this.dispatchEvent(new Event('change'));
        }
    });
}
```

### 2. Fonction utilitaire de formatage

```javascript
function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
```

### 3. Initialisation

```javascript
// Pour la page de réservation
if (document.getElementById('book_date_reservation')) {
    initializeDateField('book_date_reservation', 'date-error-message');
}

// Pour la page d'accueil
if (document.getElementById('book_date')) {
    initializeDateField('book_date', 'date-error-message-index');
}
```

---

## 🔍 Fonctionnement Détaillé

### Étape 1 : Initialisation au chargement de la page

```javascript
const today = new Date();
const todayString = formatDateToYYYYMMDD(today); // Ex: "2026-02-01"
dateInput.setAttribute('min', todayString);
```

**Résultat :** Les dates antérieures à aujourd'hui sont automatiquement grisées et non sélectionnables dans le calendrier natif.

---

### Étape 2 : Détection des dimanches

```javascript
const selectedDate = new Date(this.value + 'T00:00:00');
const dayOfWeek = selectedDate.getDay();
// 0 = Dimanche, 1 = Lundi, 2 = Mardi, etc.
```

**Note importante :** L'ajout de `'T00:00:00'` garantit que la date est interprétée dans le fuseau horaire local, évitant les décalages de jour.

---

### Étape 3 : Action si dimanche détecté

Si `dayOfWeek === 0` :

1. **Affichage du message d'erreur** sous le champ
2. **Vidage du champ** : `this.value = ''`
3. **Ajout de la classe CSS** `is-invalid` (style Bootstrap)
4. **Alerte navigateur** pour un feedback immédiat

---

### Étape 4 : Validation lors de la saisie manuelle

```javascript
dateInput.addEventListener('blur', function() {
    if (this.value) {
        this.dispatchEvent(new Event('change'));
    }
});
```

**Pourquoi ?** Si l'utilisateur saisit manuellement une date (ex: `2026-02-02`) au lieu d'utiliser le calendrier, la validation `change` est déclenchée automatiquement lors de la perte de focus.

---

## 🎨 Styles CSS Appliqués

Le message d'erreur utilise les classes Bootstrap existantes :

```html
<small id="date-error-message" class="form-text text-danger" 
       style="display: none; font-weight: bold;"></small>
```

- `text-danger` : Couleur rouge Bootstrap
- `font-weight: bold` : Texte en gras pour plus de visibilité
- `display: none` : Masqué par défaut, affiché seulement en cas d'erreur

La classe `is-invalid` (Bootstrap) ajoute automatiquement une bordure rouge au champ.

---

## 🧪 Tests et Scénarios

### Scénario 1 : Sélection d'une date passée
❌ **Impossible** : Le calendrier natif bloque automatiquement les dates < aujourd'hui

### Scénario 2 : Sélection d'un dimanche
1. Utilisateur clique sur un dimanche dans le calendrier
2. ⚠️ Message d'erreur s'affiche sous le champ
3. ⚠️ Alerte navigateur apparaît
4. ✅ Le champ est vidé automatiquement
5. ✅ Bordure rouge appliquée au champ

### Scénario 3 : Sélection d'un jour valide (Lundi-Samedi)
1. Utilisateur sélectionne un jour valide
2. ✅ Pas de message d'erreur
3. ✅ La date reste dans le champ
4. ✅ Le formulaire peut être soumis

### Scénario 4 : Saisie manuelle d'un dimanche
1. Utilisateur tape manuellement "2026-02-08" (dimanche)
2. Utilisateur quitte le champ (blur)
3. ⚠️ Validation automatique détecte le dimanche
4. ⚠️ Même comportement que Scénario 2

---

## 📁 Fichiers Modifiés

| Fichier | Modifications |
|---------|--------------|
| `reservation.html` | Champ date converti en `type="date"` + message d'erreur ajouté |
| `index.html` | Champ date converti en `type="date"` + message d'erreur ajouté |
| `js/main.js` | Ajout des fonctions `initializeDateField()` et `formatDateToYYYYMMDD()` |
| `js/main.js` | Mise à jour de `formatDateForAPI()` pour gérer le format natif |

---

## 🌐 Compatibilité Navigateurs

| Navigateur | Version | Support `<input type="date">` | Support JavaScript |
|------------|---------|-------------------------------|-------------------|
| Chrome     | 20+     | ✅ Complet                    | ✅ Complet        |
| Firefox    | 57+     | ✅ Complet                    | ✅ Complet        |
| Safari     | 14.1+   | ✅ Complet                    | ✅ Complet        |
| Edge       | 12+     | ✅ Complet                    | ✅ Complet        |
| Opera      | 11+     | ✅ Complet                    | ✅ Complet        |

**Note :** Pour les navigateurs très anciens ne supportant pas `type="date"`, le champ se comporte comme un `type="text"` standard. La validation JavaScript fonctionne toujours.

---

## 🚀 Améliorations Futures Possibles

1. **Désactiver visuellement les dimanches dans le calendrier natif** (nécessite CSS `::-webkit-calendar-picker-indicator` - support limité)

2. **Ajouter une info-bulle au survol** expliquant "Fermé le dimanche"

3. **Bloquer également les jours fériés** en ajoutant une liste de dates à exclure

4. **Validation côté serveur** dans l'Edge Function Supabase pour sécurité maximale

5. **Afficher les horaires d'ouverture** selon le jour sélectionné

---

## 📞 Support

Pour toute question ou problème :
- Vérifier la console JavaScript du navigateur (`F12`)
- Tester dans un navigateur moderne à jour
- Vérifier que le fichier `js/main.js` est bien chargé

---

## ✅ Checklist de Validation

- [x] Attribut `min` initialisé à aujourd'hui
- [x] Dimanches détectés et refusés
- [x] Message d'erreur clair affiché
- [x] Champ vidé automatiquement si dimanche
- [x] Validation lors saisie manuelle
- [x] Code JavaScript vanilla (pas de dépendances)
- [x] Compatible navigateurs modernes
- [x] Intégration avec formulaire existant
- [x] Format de date correct pour l'API (`YYYY-MM-DD`)

---

**Date de création :** 31 janvier 2026  
**Version :** 1.0  
**Auteur :** Système de réservation Quarter Time
