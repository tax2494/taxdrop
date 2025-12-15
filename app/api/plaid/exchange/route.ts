import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function POST(req: Request) {
  const { public_token, accounts } = await req.json();

  const { data: { access_token } } = await (
    await fetch("https://api.plaid.com/item/public_token/exchange", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID!,
        "PLAID-SECRET": process.env.PLAID_SECRET_SANDBOX!,
      },
      body: JSON.stringify({ public_token }),
    })
  ).json();

  for (const acc of accounts) {
    const { error } = await supabaseAdmin
      .from("accounts")
      .insert({
        id: acc.id,
        user_id: "11111111-1111-1111-1111-111111111111",
        plaid_access_token: access_token,
        plaid_item_id: acc.item_id,
        name: acc.name,
        mask: acc.mask,
        type: acc.type,
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // trigger ingestion (edge function later)
  fetch(`${process.env.NEXT_PUBLIC_URL}/api/webhook_plaid`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}