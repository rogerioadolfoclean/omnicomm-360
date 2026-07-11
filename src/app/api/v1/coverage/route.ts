import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { routeApi } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/** GET /api/v1/coverage — couverture réseau par opérateur et zone (RF-014). */
export const GET = routeApi(async (req: NextRequest) => {
  const url = new URL(req.url);
  const pays = url.searchParams.get("pays") ?? "RDC";
  const zone = url.searchParams.get("zone");
  const operateur = url.searchParams.get("operateur");
  const r = await pool.query(
    `SELECT operateur, pays, zone, technologie, qualite, population_couverte_pct
     FROM couverture_reseau
     WHERE pays = $1 AND ($2::text IS NULL OR zone ILIKE $2) AND ($3::text IS NULL OR operateur ILIKE '%' || $3 || '%')
     ORDER BY zone, operateur`,
    [pays, zone, operateur]
  );
  return NextResponse.json({ pays, zone: zone ?? "toutes", donnees: r.rows, total: r.rows.length });
});
