# Dépannage - Erreur "Erreur lors de l'enregistrement en base"

## 🔍 Diagnostic rapide

### 1. La table `reservations` existe-t-elle ?

**Vérification :**
- Allez dans Supabase Dashboard → **Table Editor**
- Cherchez la table `reservations`

**Si elle n'existe pas :**
- ✅ Exécutez le fichier `migrations/001_create_reservations_table.sql` via le SQL Editor

### 2. Les colonnes correspondent-elles ?

**Colonnes requises :**
```
- customer_name (TEXT)
- customer_email (TEXT)
- customer_phone (TEXT)
- reserved_date (DATE)
- reserved_time (TIME)
- reserved_at (TIMESTAMPTZ)
- guests (INTEGER)
- event_type (TEXT)
- notes (TEXT)
- status (TEXT)
```

**Si les colonnes ne correspondent pas :**
- Supprimez la table et recréez-la avec la migration

### 3. Les variables d'environnement sont-elles configurées ?

**Variables requises pour la fonction Edge :**

```bash
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY (optionnel pour les emails)
EMAIL_FROM (optionnel)
RESTAURANT_EMAIL (optionnel)
```

**Vérification :**
```bash
supabase secrets list
```

**Si elles manquent :**
- Configurez-les via le dashboard ou le CLI (voir SETUP_GUIDE.md)

### 4. Row Level Security (RLS) bloque-t-il l'insertion ?

**Vérification :**
- Supabase → **Authentication** → **Policies**
- Vérifiez que la table `reservations` a une policy pour `service_role`

**Si la policy manque :**
```sql
-- Exécutez dans SQL Editor
CREATE POLICY "Allow service role to insert reservations"
    ON public.reservations
    FOR INSERT
    TO service_role
    WITH CHECK (true);
```

### 5. La fonction Edge est-elle déployée ?

**Vérification :**
- Supabase → **Edge Functions**
- Vérifiez que `create-reservation` apparaît dans la liste

**Si elle n'est pas déployée :**
```bash
cd supabase/functions
supabase functions deploy create-reservation
```

## 🐛 Erreurs courantes

### Erreur : "Missing env vars"

**Cause :** Les secrets ne sont pas configurés

**Solution :**
```bash
supabase secrets set SUPABASE_URL=https://ljbghtwstlwtqrwrzcat.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<votre_key>
```

### Erreur : "relation 'public.reservations' does not exist"

**Cause :** La table n'a pas été créée

**Solution :** Exécutez la migration SQL

### Erreur : "new row violates row-level security policy"

**Cause :** Les policies RLS bloquent l'insertion

**Solution :** Ajoutez la policy pour `service_role`

### Erreur : "column 'X' does not exist"

**Cause :** La structure de la table ne correspond pas

**Solution :** Vérifiez que toutes les colonnes existent

## 📋 Checklist complète

- [ ] Table `reservations` créée avec toutes les colonnes
- [ ] RLS activé avec policies pour `service_role`
- [ ] Variables d'environnement configurées (au minimum SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY)
- [ ] Fonction Edge déployée
- [ ] Service Role Key valide (copiée depuis Project Settings → API)
- [ ] Anon Key valide dans main.js

## 🔧 Test manuel de la fonction

Pour tester directement la fonction sans passer par le frontend :

```bash
curl -X POST https://ljbghtwstlwtqrwrzcat.supabase.co/functions/v1/create-reservation \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqYmdodHdzdGx3dHFyd3J6Y2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDYyOTcsImV4cCI6MjA4NTI4MjI5N30.ITL_iy5w2ppxvm2yMQaJ68gbBNm272wkK2wFc6m-k5M" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "date": "2026-02-10",
    "time": "19:00",
    "guests": 2,
    "eventType": "standard",
    "notes": "Test de réservation"
  }'
```

**Réponse attendue :**
```json
{
  "ok": true,
  "message": "Réservation confirmée ! Un email a été envoyé.",
  "reservation": { ... }
}
```

## 📞 Support

Si le problème persiste :

1. Vérifiez les logs de la fonction Edge dans le dashboard Supabase
2. Ouvrez la console du navigateur (F12) et cherchez les erreurs
3. Vérifiez que l'URL de la fonction est correcte dans `main.js` (ligne 430)
