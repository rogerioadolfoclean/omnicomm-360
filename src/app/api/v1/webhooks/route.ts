import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pool } from "@/lib/db";
import { routeApi, erreurJson, type ContexteApi } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/** GET /api/v1/webhooks — webhooks du tenant (RF-021). */
export const GET = routeApi(async (_req: NextRequest, ctx: ContexteApi) => {
  const r = await pool.query(
    `SELECT id, url, evenements, actif, created_at FROM webhooks WHERE tenant_id = $1 ORDER BY id`,
    [ctx.tenantId]
  );
  return NextResponse.json({ donnees: r.rows, total: r.rows.length });
});

/** POST /api/v1/webhooks — crée un webhook : {"url": "https://...", "evenements": ["message.livre"]}. */
export const POST = routeApi(async (req: NextRequest, ctx: ContexteApi) => {
  let corps: { url?: string; evenements?: string[] };
  try {
    corps = await req.json();
  } catch {
    return erreurJson(400, "json_invalide", "Le corps de la requête doit être du JSON valide.");
  }
  const { url, evenements = ["message.livre"] } = corps;
  if (!url || !url.startsWith("https://"))
    return erreurJson(422, "url_invalide", "Le champ 'url' est obligatoire et doit être en HTTPS.");
  const secret = "whsec_" + crypto.randomBytes(12).toString("hex");
  const r = await pool.query(
    `INSERT INTO webhooks (tenant_id, url, evenements, secret) VALUES ($1,$2,$3,$4)
     RETURNING id, url, evenements, actif, created_at`,
    [ctx.tenantId, url, evenements, secret]
  );
  return NextResponse.json(
    { donnees: { ...r.rows[0], secret }, note: "Conservez le secret : il signe chaque livraison (en-tête X-Omni-Signature)." },
    { status: 201 }
  );
});
