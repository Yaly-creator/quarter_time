# 🚀 Solution rapide - Erreur de réservation

## ⚡ Actions immédiates (5 minutes)

### 1️⃣ Créer la table dans Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** (icône 🗃️)
4. Cliquez sur **New query**
5. Copiez-collez ce code :

```sql
-- Créer la table reservations
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    reserved_date DATE NOT NULL,
    reserved_time TIME NOT NULL,
    reserved_at TIMESTAMPTZ NOT NULL,
    guests INTEGER NOT NULL CHECK (guests >= 1 AND guests <= 30),
    event_type TEXT DEFAULT 'standard',
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(reserved_date);
CREATE INDEX IF NOT EXISTS idx_reservations_email ON public.reservations(customer_email);

-- Activer RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Permettre à service_role d'insérer
CREATE POLICY "Allow service role to insert reservations"
    ON public.reservations
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Permettre à service_role de lire
CREATE POLICY "Allow service role to select reservations"
    ON public.reservations
    FOR SELECT
    TO service_role
    USING (true);
```

6. Cliquez sur **Run** (ou Ctrl+Enter)
7. Vous devriez voir "Success. No rows returned"

### 2️⃣ Configurer les secrets

1. Dans Supabase, allez dans **Project Settings** (⚙️) → **API**
2. Copiez la clé `service_role` (⚠️ Gardez-la secrète !)
3. Allez dans **Edge Functions** → **create-reservation** (ou Functions)
4. Cliquez sur les **Settings** de la fonction
5. Ajoutez ces variables d'environnement :

```
SUPABASE_URL = https://ljbghtwstlwtqrwrzcat.supabase.co
SUPABASE_SERVICE_ROLE_KEY = <collez votre service_role key ici>
```

**Optionnel (pour les emails)** :
```
RESEND_API_KEY = <votre clé Resend si vous en avez une>
EMAIL_FROM = noreply@quartertime.fr
RESTAURANT_EMAIL = contact@quartertime.fr
```

> ⚠️ Si vous n'avez pas de clé Resend, les réservations fonctionneront quand même, mais sans emails de confirmation.

### 3️⃣ Déployer la fonction Edge

**Option A : Via le CLI Supabase (recommandé)**

```bash
# Ouvrir PowerShell dans le dossier du projet
cd c:\Users\PCIetF\Documents\GitHub\maquette_quarter_time

# Se connecter à Supabase
supabase login

# Lier votre projet
supabase link --project-ref ljbghtwstlwtqrwrzcat

# Déployer la fonction
supabase functions deploy create-reservation
```

**Option B : Via le dashboard**

Si vous avez déjà déployé la fonction, elle devrait déjà être active. Vérifiez dans **Edge Functions** que `create-reservation` apparaît.

### 4️⃣ Tester

1. Retournez sur votre site : http://127.0.0.1:5500/reservation.html
2. Remplissez le formulaire :
   - Nom : Test
   - Email : test@example.com
   - Téléphone : 0123456789
   - Date : Choisissez une date future (pas dimanche)
   - Heure : 19:00
   - Personnes : 2
3. Cliquez sur **Faire une réservation**
4. Vous devriez voir : ✅ **Réservation confirmée !**

### 5️⃣ Vérifier dans Supabase

1. Allez dans **Table Editor**
2. Cliquez sur la table `reservations`
3. Vous devriez voir votre réservation test !

---

## ❌ Si ça ne marche toujours pas

### Vérifiez les logs de la fonction

1. Supabase → **Edge Functions** → **create-reservation**
2. Cliquez sur **Logs**
3. Vous verrez l'erreur exacte

### Erreurs courantes

| Erreur dans les logs | Solution |
|---------------------|----------|
| "Missing env vars" | Configurez les secrets (étape 2) |
| "relation 'public.reservations' does not exist" | Créez la table (étape 1) |
| "new row violates row-level security" | Exécutez les policies (étape 1) |

### Console du navigateur

1. Ouvrez votre site
2. Appuyez sur **F12**
3. Allez dans l'onglet **Console**
4. Soumettez le formulaire
5. Cherchez les messages d'erreur en rouge

---

## 📚 Documentation complète

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Guide complet de configuration
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Dépannage détaillé
- [migrations/001_create_reservations_table.sql](./migrations/001_create_reservations_table.sql) - Script SQL complet

---

## ✅ Checklist

- [ ] Table `reservations` créée
- [ ] Policies RLS configurées
- [ ] SUPABASE_SERVICE_ROLE_KEY configurée
- [ ] SUPABASE_URL configurée
- [ ] Fonction Edge déployée
- [ ] Test de réservation réussi

**Une fois tout coché, votre système de réservation est opérationnel ! 🎉**
