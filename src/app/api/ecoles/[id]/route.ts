import { NextRequest, NextResponse } from "next/server";
import { updateEcole, deleteEcole } from "@/lib/db";
import { UpdateEcolePayload } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as UpdateEcolePayload;
    const result = await updateEcole(id, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Impossible de modifier l'école." }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const result = await deleteEcole(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Impossible de supprimer l'école." }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
