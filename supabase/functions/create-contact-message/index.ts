// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
}

function validatePayload(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validation nom
  if (!data.name || String(data.name).trim().length < 2) {
    errors.push("Nom requis (minimum 2 caractères)")
  }

  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push("Email invalide")
  }

  // Validation sujet
  if (!data.subject || String(data.subject).trim().length < 2) {
    errors.push("Sujet requis (minimum 2 caractères)")
  }

  // Validation message
  if (!data.message || String(data.message).trim().length < 10) {
    errors.push("Message requis (minimum 10 caractères)")
  }

  return { valid: errors.length === 0, errors }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
}

Deno.serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Méthode non autorisée" }), {
      status: 405,
      headers: corsHeaders,
    })
  }

  try {
    // 1) Lire le payload
    const payload: ContactPayload = await req.json()

    // 2) Validation
    const validation = validatePayload(payload)
    if (!validation.valid) {
      return new Response(JSON.stringify({ ok: false, errors: validation.errors }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    // 3) Charger variables d'environnement (secrets)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

    // Vérifier que les secrets sont présents
    const missing: string[] = []
    if (!supabaseUrl) missing.push("SUPABASE_URL")
    if (!supabaseServiceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY")

    if (missing.length > 0) {
      console.error("Missing env vars:", missing)
      return new Response(JSON.stringify({
        ok: false,
        error: `Configuration manquante (secrets): ${missing.join(", ")}`
      }), { status: 500, headers: corsHeaders })
    }

    // 4) Créer client Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 5) Insert DB
    const { data: contactMessage, error: dbError } = await supabase
      .from("contact_messages")
      .insert({
        customer_name: payload.name.trim(),
        customer_email: payload.email.trim(),
        subject: payload.subject.trim(),
        message: payload.message.trim(),
        status: "new",
      })
      .select()
      .single()

    if (dbError) {
      console.error("DB error:", dbError)
      return new Response(JSON.stringify({ ok: false, error: "Erreur base de données" }), {
        status: 500,
        headers: corsHeaders,
      })
    }

    // 6) Réponse OK
    return new Response(JSON.stringify({
      ok: true,
      message: "Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.",
      contactMessage,
    }), { status: 200, headers: corsHeaders })

  } catch (error) {
    console.error("Unhandled error:", error)
    return new Response(JSON.stringify({ ok: false, error: "Erreur serveur" }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
