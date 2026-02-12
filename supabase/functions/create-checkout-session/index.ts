import "jsr:@supabase/functions-js/edge-runtime.d.ts"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  description?: string
}

interface CheckoutPayload {
  items: CartItem[]
  deliveryMode: string
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
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? ""
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://quarter-time.vercel.app"

    if (!stripeSecretKey) {
      console.error("Missing STRIPE_SECRET_KEY")
      return new Response(JSON.stringify({
        ok: false,
        error: "Configuration Stripe manquante"
      }), { status: 500, headers: corsHeaders })
    }

    // Lire le payload
    const payload: CheckoutPayload = await req.json()

    // Validation
    if (!payload.items || payload.items.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "Panier vide" }), {
        status: 400,
        headers: corsHeaders,
      })
    }

    // Construire les line_items pour Stripe Checkout
    const lineItems = payload.items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          ...(item.description ? { description: item.description } : {}),
        },
        unit_amount: Math.round(item.price * 100), // Stripe utilise les centimes
      },
      quantity: item.quantity,
    }))

    // Créer la session Stripe Checkout via l'API REST
    const deliveryMode = payload.deliveryMode || "pickup"
    const params = new URLSearchParams()
    params.append("mode", "payment")
    params.append("success_url", `${siteUrl}/panier.html?payment=success&session_id={CHECKOUT_SESSION_ID}&delivery=${deliveryMode}`)
    params.append("cancel_url", `${siteUrl}/panier.html?payment=cancel`)

    // Ajouter chaque line_item
    lineItems.forEach((item, i) => {
      params.append(`line_items[${i}][price_data][currency]`, item.price_data.currency)
      params.append(`line_items[${i}][price_data][product_data][name]`, item.price_data.product_data.name)
      if (item.price_data.product_data.description) {
        params.append(`line_items[${i}][price_data][product_data][description]`, item.price_data.product_data.description)
      }
      params.append(`line_items[${i}][price_data][unit_amount]`, String(item.price_data.unit_amount))
      params.append(`line_items[${i}][quantity]`, String(item.quantity))
    })

    // Metadata pour traçabilité
    params.append("metadata[delivery_mode]", payload.deliveryMode || "pickup")
    params.append("metadata[source]", "quarter-time-website")

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })

    if (!stripeRes.ok) {
      const errText = await stripeRes.text()
      console.error("Stripe error:", stripeRes.status, errText)
      return new Response(JSON.stringify({
        ok: false,
        error: "Erreur lors de la création du paiement"
      }), { status: 500, headers: corsHeaders })
    }

    const session = await stripeRes.json()

    return new Response(JSON.stringify({
      ok: true,
      url: session.url,
    }), { status: 200, headers: corsHeaders })

  } catch (error) {
    console.error("Unhandled error:", error)
    return new Response(JSON.stringify({ ok: false, error: "Erreur serveur" }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
