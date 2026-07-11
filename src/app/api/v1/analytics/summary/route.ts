import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { routeApi, type ContexteApi } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/** GET /api/v1/analytics/summary — indicateurs clés du tenant (RF-022). */
export const GET = routeApi(async (_req: NextRequest, ctx: ContexteApi) => {
  const r = await pool.query(
    `SELECT
      (SELECT COUNT(*) FROM messages WHERE tenant_id = $1) AS messages_total,
      (SELECT COUNT(*) FILTER (WHERE statut = 'livre') * 100.0 / NULLIF(COUNT(*),0)
        FROM messages WHERE tenant_id = $1)::numeric(5,1) AS taux_livraison_pct,
      (SELECT COUNT(*) FROM appels WHERE tenant_id = $1) AS appels_total,
      (SELECT COALESCE(ROUND(AVG(mos_score),2),0) FROM appels WHERE tenant_id = $1 AND mos_score IS NOT NULL) AS mos_moyen,
      (SELECT COUNT(*) FROM sims WHERE tenant_id = $1 AND statut = 'active') AS sims_actives,
      (SELECT COALESCE(SUM(cout),0)::numeric(12,4) FROM cdrs WHERE tenant_id = $1) AS cout_total_usd`,
    [ctx.tenantId]
  );
  const parDestination = await pool.query(
    `SELECT COALESCE(pays_destination,'Autres') AS pays, COUNT(*) AS volume,
            COALESCE(SUM(cout),0)::numeric(10,4) AS cout_usd
     FROM cdrs WHERE tenant_id = $1 GROUP BY 1 ORDER BY cout_usd DESC LIMIT 10`,
    [ctx.tenantId]
  );
  return NextResponse.json({ donnees: { ...r.rows[0], cout_par_destination: parDestination.rows } });
});
