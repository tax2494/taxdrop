import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const userId = "11111111-1111-1111-1111-111111111111";

  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("category_final, amount")
    .eq("reviewed", true)
    .in("account_id", function (q) {
      return q.select("id").from("accounts").eq("user_id", userId);
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // aggregate by Schedule-C line
  const totals: Record<string, number> = {};
  for (const tx of data || []) {
    const line = tx.category_final || "other";
    totals[line] = (totals[line] || 0) + Number(tx.amount);
  }
  return NextResponse.json(totals);
}