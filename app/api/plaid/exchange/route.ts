import { plaidClient } from "@/lib/plaid";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const { public_token, accounts } = await req.json();

  // 1. Exchange public token for access token
  const { data: { access_token, item_id } } =
    await plaidClient.itemPublicTokenExchange({ public_token });

  // 2. Store accounts in Supabase
  for (const acc of accounts) {
    const { error } = await supabaseAdmin.from("accounts").insert({
      id: acc.id,
      user_id: "11111111-1111-1111-1111-111111111111",
      plaid_access_token: access_token,
      plaid_item_id: item_id,
      name: acc.name,
      mask: acc.mask,
      type: acc.type,
    });
    if (error) {
      console.error("Account insert error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }
  }

  // 3. Trigger edge function (fire-and-forget)
  fetch("https://vahsexnjvzqupomlcbkg.supabase.co/functions/v1/webhook_plaid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token }),
  }).catch(() => {}); // swallow network errors

  // 4. Done
  return Response.json({ ok: true });
}