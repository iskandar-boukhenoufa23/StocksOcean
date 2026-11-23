
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe signature error:", error);

    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const metadata = session.metadata;

    if (
      !metadata?.user_id ||
      !metadata.plan_id ||
      !metadata.billing ||
      !metadata.download_limit ||
      !metadata.amount_cents
    ) {
      throw new Error("Missing Checkout metadata");
    }

    if (
      !["monthly", "yearly"].includes(metadata.billing)
    ) {
      throw new Error("Invalid billing period");
    }

    const amount = Number(metadata.amount_cents);
    const downloadLimit = Number(metadata.download_limit);

    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      !Number.isSafeInteger(downloadLimit) ||
      downloadLimit < 0 ||
      session.amount_total !== amount ||
      session.currency !== "usd"
    ) {
      throw new Error("Invalid payment amount or quota");
    }

    // Calculate subscription expiration
    const startedAt = new Date();
    const endsAt = new Date(startedAt);

    if (metadata.billing === "yearly") {
      endsAt.setFullYear(endsAt.getFullYear() + 1);
    } else {
      endsAt.setMonth(endsAt.getMonth() + 1);
    }

    // Atomic fulfillment and duplicate-session protection
    const { error } = await supabaseAdmin.rpc(
      "create_stripe_subscription",
      {
        p_user_id: metadata.user_id,
        p_plan_id: metadata.plan_id,
        p_session_id: session.id,
        p_price: amount / 100,
        p_download_limit: downloadLimit,
        p_started_at: startedAt.toISOString(),
        p_ends_at: endsAt.toISOString(),
      }
    );

    if (error) {
      console.error("Subscription fulfillment error:", error);
      throw error;
    }

    return NextResponse.json({
      received: true,
      message: "Subscription activated",
    });

  } catch (error) {
    console.error("Stripe webhook processing error:", error);

    return NextResponse.json(
      { error: "Subscription activation failed" },
      { status: 500 }
    );
  }
}
