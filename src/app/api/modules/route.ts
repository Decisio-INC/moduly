import { NextRequest, NextResponse } from "next/server";
import { createModule } from "@/lib/db";
import { CreateModulePayload } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateModulePayload;
    const result = await createModule(body);

    if (!result.success) {
      if (result.conflict) {
        return NextResponse.json(
          {
            error: result.error,
            conflict: result.conflict,
          },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: result.error || "Impossible de créer le module." }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
