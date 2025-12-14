import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const userId = "11111111-1111-1111-1111-111111111111";

  // 1. get user’s account ids
  const { data: accts } = await supabaseAdmin
    .from("accounts")
    .select("id")
    .eq("user_id", userId);

  if (!accts || accts.length === 0)
    return NextResponse.json({});

  const accountIds = accts.map((a) => a.id);

  // 2. aggregate reviewed tx for those accounts
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