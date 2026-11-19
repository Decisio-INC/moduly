import { NextRequest, NextResponse } from "next/server";
import { getCatalog, getRawData } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeArchived = searchParams.get("all") === "true";
    const raw = searchParams.get("raw") === "true";

    if (raw) {
      const rawData = await getRawData();
      return NextResponse.json(rawData, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    }

    const catalog = await getCatalog(!includeArchived);
    return NextResponse.json(catalog, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur interne";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
