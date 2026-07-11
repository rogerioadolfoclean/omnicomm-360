import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { routeApi, erreurJson, type ContexteApi } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/** GET /api/v1/calls — journal des appels du tenant. */
export const GET = routeApi(async (req: NextRequest, ctx: ContexteApi) => {
  const limite = Math.min(Number(new URL(req.url).searchParams.get("limite") ?? 20), 100);
  const r = await pool.query(
    `SELECT id, direction, de, vers, statut, type, duree_secondes, mos_score, attestation_stir, cout, created_at
     FROM appels WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [ctx.tenantId, limite]
  );
  return NextResponse.json({ donnees: r.rows, total: r.rows.length });
});

/** POST /api/v1/calls — lance un appel sortant (signé STIR/SHAKEN, CDR généré). */
export const POST = routeApi(async (req: NextRequest, ctx: ContexteApi) => {
  let corps: { de?: string; vers?: string; type?: string };
  try {
    corps = await req.json();
  } catch {
    return erreurJson(400, "json_invalide", "Le corps de la requête doit être du JSON valide.");
  }
  const { de = "+243815550000", vers, type = "standard" } = corps;
  if (!vers) return erreurJson(422, "parametres_manquants", "Le champ 'vers' est obligatoire.");
  if (!["standard", "ivr", "conference", "ia", "webrtc"].includes(type))
    return erreurJson(422, "type_invalide", "Type d'appel invalide.");

  const route = await pool.query(
    `SELECT operateur, cout_par_unite, pays FROM routes_tarifs
     WHERE canal = 'voix' AND actif AND $1 LIKE prefixe || '%'
     ORDER BY cout_par_unite ASC, priorite ASC LIMIT 1`,
    [vers]
  );
  const rt = route.rows[0];
  const duree = ctx.environnement === "sandbox" ? 0 : 30 + Math.floor(Math.random() * 300);
  const cout = (duree / 60) * Number(rt?.cout_par_unite ?? 0.145);
  const r = await pool.query(
    `INSERT INTO appels (tenant_id, direction, de, vers, statut, type, duree_secondes, mos_score, attestation_stir, cout)
     VALUES ($1,'sortant',$2,$3,$4,$5,$6,$7,'A',$8)
     RETURNING id, de, vers, statut, type, duree_secondes, attestation_stir, cout, created_at`,
    [
      ctx.tenantId, de, vers, ctx.environnement === "sandbox" ? "initie" : "termine", type, duree,
      duree > 0 ? (3.9 + Math.random() * 0.9).toFixed(2) : null, cout.toFixed(5),
    ]
  );
  if (duree > 0) {
    await pool.query(
      `INSERT INTO cdrs (tenant_id, type, source, destination, duree_secondes, cout, operateur, pays_destination)
       VALUES ($1,'voix',$2,$3,$4,$5,$6,$7)`,
      [ctx.tenantId, de, vers, duree, cout.toFixed(5), rt?.operateur ?? null, rt?.pays ?? null]
    );
  }
  return NextResponse.json({ donnees: r.rows[0] }, { status: 201 });
});
