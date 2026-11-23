import { NextRequest, NextResponse } from "next/server";
import { createUserSupabase, createClient } from "@/lib/supabaseServer";
import { stripe } from "@/lib/stripe";
import { getErrorMessage } from "@/lib/errors";

const isWithin48Hours = (createdAt: string) => {
  const signupTime = new Date(createdAt).getTime();
  const diffInHours = (Date.now() - signupTime) / (1000 * 60 * 60);

  return diffInHours >= 0 && diffInHours <= 48;
};

const calculateFinalPrice = (
  originalPrice: number | null,
  planDiscount: number | null,
) => {
  const price = originalPrice ?? 0;
  const discount = planDiscount ?? 0;

  return price * (1 - discount / 100);
};

export async function POST(request: NextRequest) {
  try {
    const user = await createClient();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createUserSupabase();
    const body = await request.json();

    const planId = typeof body.plan_id === "string" ? body.plan_id : "";

    const billing =
      body.billing === "monthly" || body.billing === "yearly"
        ? body.billing
        : null;

    if (!planId || !billing) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 },
      );
    }

    // Get subscription plan
    const { data: plan, error: fetchError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Preserve existing pricing logic
    const isYearly = billing === "yearly";

    const originalPrice = isYearly
      ? plan.original_price_yearly
      : plan.original_price_monthly;

    const finalPrice =
      user.created_at && isWithin48Hours(user.created_at)
        ? calculateFinalPrice(originalPrice, plan.first_month_discount_percent)
        : (originalPrice ?? 0);

    if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
      return NextResponse.json(
        { error: "Invalid plan price" },
        { status: 400 },
      );
    }

    const downloadLimit = (plan.monthly_downloads ?? 0) * (isYearly ? 12 : 1);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
      throw new Error("Missing NEXT_PUBLIC_SITE_URL");
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      customer_email: user.email,

      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: Math.round(finalPrice * 100),
            product_data: {
              name: `StocksOcean ${billing} subscription`,
              description: `${plan.monthly_downloads ?? 0} monthly downloads`,
            },
          },
        },
      ],

      metadata: {
        user_id: user.id,
        plan_id: plan.id.toString(),
        billing,
        download_limit: downloadLimit.toString(),
        amount_cents: Math.round(finalPrice * 100).toString(),
      },

      success_url: `${siteUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${siteUrl}/payments/cancel`,
    });

    return NextResponse.json({
      message: "Checkout session created",
      url: session.url,
      sessionId: session.id,
      finalPrice,
    });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
