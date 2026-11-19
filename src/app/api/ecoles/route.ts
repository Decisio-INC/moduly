import { NextRequest, NextResponse } from "next/server";
import { getRawData } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getRawData();
    return NextResponse.json(data.ecoles, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nom = body.nom?.trim();
    if (!nom) {
      return NextResponse.json({ error: "Le nom de l'école est requis." }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("ecoles")
      .insert({ nom, statut: true })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true, ecole: data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
