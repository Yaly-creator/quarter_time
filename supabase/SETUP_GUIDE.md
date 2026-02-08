# Guide de Configuration Supabase - Quarter Time

## Étape 1 : Créer la table reservations

### Option A : Via l'interface Supabase (Recommandé)

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Sélectionnez votre projet : `ljbghtwstlwtqrwrzcat`
3. Allez dans **SQL Editor** (icône de base de données dans le menu)
4. Cliquez sur **New query**
5. Copiez-collez le contenu du fichier `migrations/001_create_reservations_table.sql`
6. Cliquez sur **Run** pour exécuter la migration

### Option B : Via le CLI Supabase

```bash
# Dans le dossier du projet
cd supabase
supabase db push
```

## Étape 2 : Vérifier que la table est créée

1. Dans Supabase, allez dans **Table Editor**
2. Vous devriez voir la table `reservations` avec les colonnes :
   - `id` (UUID)
   - `customer_name` (TEXT)
   - `customer_email` (TEXT)
   - `customer_phone` (TEXT)
   - `reserved_date` (DATE)
   - `reserved_time` (TIME)
   - `reserved_at` (TIMESTAMPTZ)
   - `guests` (INTEGER)
   - `event_type` (TEXT)
   - `notes` (TEXT)
   - `status` (TEXT)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

## Étape 3 : Configurer les secrets de la fonction Edge

La fonction Edge `create-reservation` nécessite les secrets suivants :

### Dans Supabase Dashboard

1. Allez dans **Edge Functions** → **Settings**
2. Ajoutez les secrets suivants :

```bash
SUPABASE_URL=https://ljbghtwstlwtqrwrzcat.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<votre_service_role_key>
RESEND_API_KEY=<votre_resend_api_key>
EMAIL_FROM=noreply@votre-domaine.com
RESTAURANT_EMAIL=contact@quartertime.fr
```

### Via le CLI Supabase

```bash
# Définir les secrets
supabase secrets set SUPABASE_URL=https://ljbghtwstlwtqrwrzcat.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<votre_key>
supabase secrets set RESEND_API_KEY=<votre_key>
supabase secrets set EMAIL_FROM=noreply@votre-domaine.com
supabase secrets set RESTAURANT_EMAIL=contact@quartertime.fr
```

## Étape 4 : Déployer la fonction Edge

```bash
# Dans le dossier du projet
cd supabase/functions

# Déployer la fonction
supabase functions deploy create-reservation
```

## Étape 5 : Tester la réservation

1. Allez sur votre site : http://127.0.0.1:5500/reservation.html
2. Remplissez le formulaire
3. Soumettez la réservation
4. Vérifiez dans Supabase → **Table Editor** → `reservations` que la réservation a été créée

## Vérification des erreurs

### Si vous avez toujours l'erreur "Erreur lors de l'enregistrement en base"

1. **Vérifiez les logs de la fonction Edge** :
   - Allez dans Supabase → **Edge Functions** → **create-reservation** → **Logs**
   - Cherchez les erreurs spécifiques

2. **Vérifiez les permissions RLS** :
   - Allez dans **Authentication** → **Policies**
   - Assurez-vous que les policies pour `service_role` sont actives

3. **Vérifiez que tous les secrets sont configurés** :
   ```bash
   supabase secrets list
   ```

4. **Testez la fonction directement** :
   ```bash
   curl -X POST https://ljbghtwstlwtqrwrzcat.supabase.co/functions/v1/create-reservation \
     -H "Authorization: Bearer <ANON_KEY>" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test",
       "email": "test@example.com",
       "phone": "0123456789",
       "date": "2026-02-10",
       "time": "12:00",
       "guests": 2
     }'
   ```

## Obtenir votre Service Role Key

1. Allez dans Supabase Dashboard
2. **Project Settings** → **API**
3. Copiez la clé `service_role` (gardez-la secrète !)

## Configuration de Resend (pour les emails)

1. Créez un compte sur [resend.com](https://resend.com)
2. Créez une API Key
3. Ajoutez-la dans les secrets Supabase

Si vous n'utilisez pas Resend pour le moment, vous pouvez commencer sans les emails en commentant le code d'envoi d'emails dans `index.ts`.
