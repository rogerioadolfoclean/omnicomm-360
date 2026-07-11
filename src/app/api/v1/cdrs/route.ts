import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { routeApi, type ContexteApi } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/** GET /api/v1/cdrs — Call Detail Records du tenant (RF-023). */
export const GET = routeApi(async (req: NextRequest, ctx: ContexteApi) => {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const limite = Math.min(Number(url.searchParams.get("limite") ?? 20), 200);
  const r = await pool.query(
    `SELECT id, type, source, destination, debut, duree_secondes, cout, operateur, pays_destination
     FROM cdrs WHERE tenant_id = $1 AND ($2::text IS NULL OR type = $2)
     ORDER BY debut DESC LIMIT $3`,
    [ctx.tenantId, type, limite]
  );
  return NextResponse.json({ donnees: r.rows, total: r.rows.length });
});
