import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { txId, line } = await req.json();
  const userId = "11111111-1111-1111-1111-111111111111";

  // 1. verify ownership (get account ids for this user)
  const { data: accts } = await supabaseAdmin
    .from("accounts")
    .select("id")
    .eq("user_id", userId);
  if (!accts || accts.length === 0)
    return NextResponse.json({ error: "No accounts" }, { status: 404 });

  const accountIds = accts.map((a) => a.id);

  // 2. update only if tx belongs to one of those accounts
  const { error: txErr } = await supabaseAdmin
    .from("transactions")
    .update({ category_final: line, reviewed: true })
    .eq("id", txId)
    .in("account_id", accountIds);

  if (txErr) return NextResponse.json({ error: txErr.message }, { status: 500 });

  // 3. TODO recompute tax lines (edge function deploy later)
  console.log("TODO: recompute tax lines");

  return NextResponse.json({ ok: true });
}