import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// fail-fast if env missing
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function GET() {
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