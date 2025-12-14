import { getSupabaseAdmin } from "@/lib/supabase";
const supabase = getSupabaseAdmin();
import { NextResponse } from "next/server";

export async function GET() {
  // Week-1 hard-coded user
  const userId = "11111111-1111-1111-1111-111111111111";

  const { data, error } = await supabaseAdmin
    .from("transactions")
    .select("id, merchant, amount, category_final")
    .eq("reviewed", false)
    .order("date", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}