import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { routeApi, erreurJson, type ContexteApi } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/** GET /api/v1/numbers — numéros du tenant + inventaire disponible (RF-015). */
export const GET = routeApi(async (req: NextRequest, ctx: ContexteApi) => {
  const url = new URL(req.url);
  const statut = url.searchParams.get("statut");
  const r = await pool.query(
    `SELECT id, numero, pays, type, capacites, cout_mensuel, statut
     FROM numeros_virtuels
     WHERE (tenant_id = $1 OR statut = 'disponible') AND ($2::text IS NULL OR statut = $2)
     ORDER BY statut, pays, numero LIMIT 100`,
    [ctx.tenantId, statut]
  );
  return NextResponse.json({ donnees: r.rows, total: r.rows.length });
});

/** POST /api/v1/numbers — réserve un numéro disponible : {"id": 5}. */
export const POST = routeApi(async (req: NextRequest, ctx: ContexteApi) => {
  let corps: { id?: number };
  try {
    corps = await req.json();
  } catch {
    return erreurJson(400, "json_invalide", "Le corps de la requête doit être du JSON valide.");
  }
  if (!corps.id) return erreurJson(422, "parametres_manquants", "Le champ 'id' est obligatoire.");
  const r = await pool.query(
    `UPDATE numeros_virtuels SET tenant_id = $1, statut = 'attribue'
     WHERE id = $2 AND statut = 'disponible'
     RETURNING id, numero, pays, type, cout_mensuel, statut`,
    [ctx.tenantId, corps.id]
  );
  if (!r.rows[0]) return erreurJson(409, "indisponible", "Ce numéro n'est pas (ou plus) disponible.");
  return NextResponse.json({ donnees: r.rows[0] }, { status: 201 });
});
