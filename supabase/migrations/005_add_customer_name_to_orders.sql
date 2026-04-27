-- ============================================
-- Migration 005: Ajouter customer_name à orders
-- Permet d'afficher le nom du client sur l'historique
-- et sur le dashboard restaurant (cohérence avec hweb-dashboard)
-- ============================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT;

COMMENT ON COLUMN public.orders.customer_name IS
  'Nom saisi par le client lors de la commande (sert de justificatif au restaurant).';
