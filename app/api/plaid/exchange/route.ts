import { plaidClient } from "@/lib/plaid";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const { public_token, accounts } = await req.json();

  const {
    data: { access_token, item_id },
  } = await plaidClient.itemPublicTokenExchange({ public_token });

  for (const acc of accounts) {
    await supabaseAdmin.from("accounts").insert({
      id: acc.id,
      user_id: "11111111-1111-1111-1111-111111111111", // week-1 placeholder
      plaid_access_token: access_token,
      plaid_item_id: item_id,
      name: acc.name,
      mask: acc.mask,
      type: acc.type,
    });
  }

  // 🚫 ingestion intentionally disabled for now

  return Response.json({ ok: true });
}
