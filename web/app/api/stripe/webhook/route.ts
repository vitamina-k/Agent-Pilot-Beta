import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  const supabase = await createServiceClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === "subscription") {
          // Subscription purchase
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          const priceId = subscription.items.data[0].price.id;

          // Find plan by price ID
          const plan = Object.values(PLANS).find((p) => p.priceId === priceId);

          if (plan && session.customer_email) {
            // Update user plan and add credits
            const { data: user } = await supabase
              .from("usuarios_pro")
              .select("id, creditos_disponibles")
              .eq("Correo_Electronico", session.customer_email)
              .single();

            if (user) {
              await supabase
                .from("usuarios_pro")
                .update({
                  plan_actual: plan.id,
                  stripe_customer_id: session.customer as string,
                  creditos_disponibles: user.creditos_disponibles + plan.credits,
                })
                .eq("id", user.id);

              // Record transaction
              await supabase.from("transacciones").insert({
                usuario_id: user.id,
                tipo: "suscripcion",
                creditos: plan.credits,
                concepto: `Suscripción plan ${plan.name}`,
                stripe_payment_id: session.id,
              });
            }
          }
        } else if (session.mode === "payment") {
          // One-time credit purchase
          const credits = session.metadata?.credits
            ? parseInt(session.metadata.credits)
            : 0;

          if (credits && session.customer_email) {
            const { data: user } = await supabase
              .from("usuarios_pro")
              .select("id, creditos_disponibles")
              .eq("Correo_Electronico", session.customer_email)
              .single();

            if (user) {
              await supabase
                .from("usuarios_pro")
                .update({
                  creditos_disponibles: user.creditos_disponibles + credits,
                })
                .eq("id", user.id);

              await supabase.from("transacciones").insert({
                usuario_id: user.id,
                tipo: "compra",
                creditos: credits,
                concepto: `Compra de ${credits} créditos`,
                stripe_payment_id: session.id,
              });
            }
          }
        }
        break;
      }

      case "invoice.paid": {
        // Subscription renewal
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string };

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription
          );
          const priceId = subscription.items.data[0].price.id;
          const plan = Object.values(PLANS).find((p) => p.priceId === priceId);

          if (plan && invoice.customer_email) {
            const { data: user } = await supabase
              .from("usuarios_pro")
              .select("id, creditos_disponibles")
              .eq("Correo_Electronico", invoice.customer_email)
              .single();

            if (user) {
              await supabase
                .from("usuarios_pro")
                .update({
                  creditos_disponibles: user.creditos_disponibles + plan.credits,
                })
                .eq("id", user.id);

              await supabase.from("transacciones").insert({
                usuario_id: user.id,
                tipo: "suscripcion",
                creditos: plan.credits,
                concepto: `Renovación plan ${plan.name}`,
                stripe_payment_id: invoice.id,
              });
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        // Subscription cancelled
        const subscription = event.data.object as Stripe.Subscription;

        const { data: user } = await supabase
          .from("usuarios_pro")
          .select("id")
          .eq("stripe_customer_id", subscription.customer as string)
          .single();

        if (user) {
          await supabase
            .from("usuarios_pro")
            .update({ plan_actual: "free" })
            .eq("id", user.id);
        }
        break;
      }
    }
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return new NextResponse("OK", { status: 200 });
}
