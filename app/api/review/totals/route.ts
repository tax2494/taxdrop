import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function GET() {
  const userId = "11111111-1111-1111-1111-111111111111";

  // 1. get user’s account ids
  const { data: accts, error: acctErr } = await supabaseAdmin
    .from("accounts")
    .select("id")
    .eq("user_id", userId);

  if (acctErr) return NextResponse.json({ error: acctErr.message }, { status: 500 });
  if (!accts || accts.length === 0) return NextResponse.json({});

  const accountIds = accts.map((a) => a.id);

  // 2. aggregate reviewed tx
  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("category_final, amount")
    .eq("reviewed", true)
    .in("account_id", accountIds);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 3. sum by Schedule-C line
  const totals: Record<string, number> = {};
  for (const tx of data || []) {
    const line = tx.category_final || "other";
    totals[line] = (totals[line] || 0) + Number(tx.amount);
  }

  return NextResponse.json(totals);
}