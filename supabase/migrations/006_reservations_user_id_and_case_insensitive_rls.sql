-- ============================================
-- Migration 006: user_id sur reservations + RLS case-insensitive + backfill
-- Corrige le cas où un client connecté ne voyait pas ses réservations
-- parce que customer_email différait (casse ou adresse) de son email auth.
-- ============================================

-- 1) Ajouter user_id (nullable pour ne pas casser les invités qui réservent
--    via l'Edge Function sans compte)
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);

-- 2) Backfill : associer les réservations existantes à un user auth si l'email
--    correspond (case-insensitive).
UPDATE public.reservations r
   SET user_id = u.id
  FROM auth.users u
 WHERE r.user_id IS NULL
   AND lower(r.customer_email) = lower(u.email);

-- 3) Policy de lecture élargie : un user voit ses réservations via
--    user_id OU via email (case-insensitive).
DROP POLICY IF EXISTS "Allow users to view their own reservations" ON public.reservations;

CREATE POLICY "Users can view their own reservations"
    ON public.reservations
    FOR SELECT
    TO authenticated
    USING (
      user_id = auth.uid()
      OR lower(customer_email) = lower(auth.jwt() ->> 'email')
    );
