// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

interface ReservationPayload {
  name: string
  email: string
  phone: string
  date: string  // YYYY-MM-DD
  time: string  // HH:MM
  guests: number
  eventType?: string
  notes?: string
}

function validatePayload(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validation emailsupabase functions deploy create-reservation

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push("Email invalide")
  }

  // Validation téléphone
  if (!data.phone || String(data.phone).trim().length < 10) {
    errors.push("Téléphone requis (minimum 10 caractères)")
  }

  // Validation guests
  const guests = Number(data.guests)
  if (!guests || guests < 1 || guests > 30) {
    errors.push("Nombre de personnes doit être entre 1 et 30")
  }

  // Validation date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!data.date || !dateRegex.test(data.date)) {
    errors.push("Date invalide (format YYYY-MM-DD)")
  }

  // Validation time format
  const timeRegex = /^\d{2}:\d{2}$/
  if (!data.time || !timeRegex.test(data.time)) {
    errors.push("Heure invalide (format HH:MM)")
  }

  // Validation name
  if (!data.name || String(data.name).trim().length < 2) {
    errors.push("Nom requis (minimum 2 caractères)")
  }

  return { valid: errors.length === 0, errors }
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function formatDateFR(dateISO: string): string {
  // dateISO: YYYY-MM-DD
  const [y, m, d] = dateISO.split("-").map(Number)
  if (!y || !m || !d) return dateISO
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`
}

function generateClientConfirmationEmail(payload: ReservationPayload) {
  const name = escapeHtml(payload.name)
  const email = escapeHtml(payload.email)
  const phone = escapeHtml(payload.phone)
  const date = escapeHtml(formatDateFR(payload.date))
  const time = escapeHtml(payload.time)
  const guests = escapeHtml(String(payload.guests))
  const eventType = escapeHtml(payload.eventType || "Réservation standard")
  const notes = payload.notes ? escapeHtml(payload.notes) : ""

  return `
  <div style="font-family: Arial, sans-serif; line-height: 1.5;">
    <h2 style="margin:0 0 12px;">✅ Confirmation de votre réservation</h2>
    <p>Bonjour <strong>${name}</strong>,</p>
    <p>Votre réservation a bien été enregistrée. Voici le récapitulatif :</p>

    <table style="border-collapse: collapse; width:100%; max-width:520px;">
      <tr><td style="padding:6px 0;"><strong>Date</strong></td><td style="padding:6px 0;">${date}</td></tr>
      <tr><td style="padding:6px 0;"><strong>Heure</strong></td><td style="padding:6px 0;">${time}</td></tr>
      <tr><td style="padding:6px 0;"><strong>Personnes</strong></td><td style="padding:6px 0;">${guests}</td></tr>
      <tr><td style="padding:6px 0;"><strong>Téléphone</strong></td><td style="padding:6px 0;">${phone}</td></tr>
      <tr><td style="padding:6px 0;"><strong>Email</strong></td><td style="padding:6px 0;">${email}</td></tr>
      <tr><td style="padding:6px 0;"><strong>Type</strong></td><td style="padding:6px 0;">${eventType}</td></tr>
    </table>

    ${notes ? `<p><strong>Notes :</strong> ${notes}</p>` : ""}

    <hr style="margin:18px 0;" />
    <p>À bientôt chez <strong>Quarter Time</strong> 🍽️</p>
  </div>
  `
}

async function sendResendEmail(params: {
  apiKey: string
  from: string
  to: string
  subject: string
  html: string
  replyTo?: string
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      ...(params.replyTo ? { reply_to: params.replyTo } : {}),
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Resend error ${res.status}: ${errText}`)
  }

  return await res.json().catch(() => ({}))
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
    const payload: ReservationPayload = await req.json()

    // 2) Validation
    const validation = validatePayload(payload)
    if (!validation.valid) {
      return new Response(JSON.stringify({ ok: false, errors: validation.errors }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    // 3) Charger variables d'environnement (secrets)
    const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? ""
    const emailFrom = Deno.env.get("EMAIL_FROM") ?? ""
    const restaurantEmail = Deno.env.get("RESTAURANT_EMAIL") ?? ""

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""

    // 🔥 IMPORTANT: si un secret manque, on retourne une erreur claire
    const missing: string[] = []
    if (!resendApiKey) missing.push("RESEND_API_KEY")
    if (!emailFrom) missing.push("EMAIL_FROM")
    if (!restaurantEmail) missing.push("RESTAURANT_EMAIL")
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

    // 5) Calcul date/heure ISO pour reserved_at
    const reservedAt = new Date(`${payload.date}T${payload.time}:00`)

    // 6) Insert DB
    const { data: reservation, error: dbError } = await supabase
      .from("reservations")
      .insert({
        customer_name: payload.name,
        customer_email: payload.email,
        customer_phone: payload.phone,
        reserved_date: payload.date,
        reserved_time: payload.time,
        reserved_at: reservedAt.toISOString(),
        guests: payload.guests,
        event_type: payload.eventType || "standard",
        notes: payload.notes || "",
        status: "confirmed",
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

    // 7) Email RESTO
    try {
      const htmlResto = `
        <h2>Nouvelle réservation reçue</h2>
        <p><strong>Nom:</strong> ${escapeHtml(payload.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>Téléphone:</strong> ${escapeHtml(payload.phone)}</p>
        <p><strong>Date:</strong> ${escapeHtml(formatDateFR(payload.date))}</p>
        <p><strong>Heure:</strong> ${escapeHtml(payload.time)}</p>
        <p><strong>Nombre de personnes:</strong> ${escapeHtml(String(payload.guests))}</p>
        <p><strong>Type d'événement:</strong> ${escapeHtml(payload.eventType || "Standard")}</p>
        ${payload.notes ? `<p><strong>Notes:</strong> ${escapeHtml(payload.notes)}</p>` : ""}
        <hr />
        <p><strong>ID réservation:</strong> ${reservation.id}</p>
      `

      await sendResendEmail({
        apiKey: resendApiKey,
        from: emailFrom,
        to: restaurantEmail,
        replyTo: payload.email, // répondre au client directement
        subject: `Nouvelle réservation - ${payload.name} (${payload.date} ${payload.time})`,
        html: htmlResto,
      })
    } catch (e) {
      console.error("Restaurant email error:", e)
      // On ne bloque pas la réservation si l'email échoue
    }

    // 8) Email CLIENT
    try {
      const htmlClient = generateClientConfirmationEmail(payload)

      await sendResendEmail({
        apiKey: resendApiKey,
        from: emailFrom,
        to: payload.email,
        replyTo: restaurantEmail, // le client répond au resto
        subject: `✅ Confirmation - Quarter Time (${payload.date} ${payload.time})`,
        html: htmlClient,
      })
    } catch (e) {
      console.error("Client email error:", e)
      // On ne bloque pas la réservation si l'email échoue
    }

    // 9) Réponse OK
    return new Response(JSON.stringify({
      ok: true,
      message: "Réservation confirmée ! Un email a été envoyé.",
      reservation,
    }), { status: 200, headers: corsHeaders })

  } catch (error) {
    console.error("Unhandled error:", error)
    return new Response(JSON.stringify({ ok: false, error: "Erreur serveur" }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})

