import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Configuration, PlaidApi, PlaidEnvironments } from "https://esm.sh/plaid";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE")!
);

const plaid = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments.sandbox,
    baseOptions: {
      headers: {
        "PLAID-CLIENT-ID": Deno.env.get("PLAID_CLIENT_ID")!,
        "PLAID-SECRET": Deno.env.get("PLAID_SECRET_SANDBOX")!, // ✅ FIX
      },
    },
  })
);

const CATEGORY_MAP: Record<string, string> = {
  Gas: "auto",
  "Office Depot": "office",
  Starbucks: "meals",
  Facebook: "advertising",
  "Google Ads": "advertising",
  Uber: "auto",
};

Deno.serve(async (req) => {
  const { access_token } = await req.json();

  const { data } = await plaid.transactionsGet({
    access_token,
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    count: 500,
  });

  const rows = data.transactions.map((t) => ({
    id: t.transaction_id,
    account_id: t.account_id,
    date: t.date,
    amount: t.amount,
    merchant: t.merchant_name || t.name,
    category_ai:
      CATEGORY_MAP[t.merchant_name || t.name] || "other",
    category_final:
      CATEGORY_MAP[t.merchant_name || t.name] || "other",
    reviewed: false,
  }));

  await supabase.from("transactions").upsert(rows, {
    onConflict: "id",
  });

  return new Response(
    JSON.stringify({ inserted: rows.length }),
    { headers: { "Content-Type": "application/json" } }
  );
});
