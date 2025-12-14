import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { txId, line } = await req.json();
  // Week-1 hard-coded user
  const userId = "11111111-1111-1111-1111-111111111111";

  // 1. mark reviewed + set final category
  const { error: txErr } = await supabaseAdmin
    .from("transactions")
    .update({ category_final: line, reviewed: true })
    .eq("id", txId)
    .eq("account_id", function (q) {
      return q.select("id").from("accounts").eq("user_id", userId);
    }); // cheap ownership guard

  if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 });

  // 2. recompute tax_lines for 2024
  await supabaseAdmin.rpc("recompute_tax_lines", { p_user_id: userId, p_year: 2024 });

  return NextResponse.json({ ok: true });
}