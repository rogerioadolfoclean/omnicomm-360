import "server-only";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { pool } from "./db";

export type ContexteApi = {
  tenantId: number;
  apiKeyId: number;
  environnement: "production" | "sandbox";
  scopes: string[];
};

/** Authentifie une requête API v1 par clé Bearer (RF-016). */
export async function authentifierApi(req: NextRequest): Promise<ContexteApi | null> {
  const auth = req.headers.get("authorization") ?? "";
  const cle = auth.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!cle) return null;
  const hash = crypto.createHash("sha256").update(cle).digest("hex");
  const r = await pool.query(
    `SELECT id, tenant_id, environnement, scopes FROM api_keys WHERE cle_hash = $1 AND actif = TRUE`,
    [hash]
  );
  const k = r.rows[0];
  if (!k) return null;
  await pool.query(`UPDATE api_keys SET derniere_utilisation = NOW() WHERE id = $1`, [k.id]);
  return { tenantId: k.tenant_id, apiKeyId: k.id, environnement: k.environnement, scopes: k.scopes };
}

/** Journalise l'appel API (logs temps réel du portail développeur). */
export async function loggerApi(
  req: NextRequest,
  ctx: ContexteApi | null,
  statut: number,
  dureeMs: number
) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "inconnue";
  await pool.query(
    `INSERT INTO logs_api (tenant_id, api_key_id, methode, endpoint, statut_http, duree_ms, ip)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [ctx?.tenantId ?? null, ctx?.apiKeyId ?? null, req.method, new URL(req.url).pathname, statut, Math.round(dureeMs), ip]
  );
}

export function erreurJson(statut: number, code: string, message: string) {
  return NextResponse.json({ erreur: { code, message } }, { status: statut });
}

/** Enveloppe standard : auth + log + gestion d'erreurs pour toutes les routes /api/v1. */
export function routeApi(
  handler: (req: NextRequest, ctx: ContexteApi) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const debut = performance.now();
    let statut = 500;
    let ctx: ContexteApi | null = null;
    try {
      ctx = await authentifierApi(req);
      if (!ctx) {
        statut = 401;
        return erreurJson(401, "non_autorise", "Clé API manquante ou invalide. Utilisez l'en-tête Authorization: Bearer <clé>.");
      }
      const res = await handler(req, ctx);
      statut = res.status;
      return res;
    } catch (e) {
      statut = 500;
      return erreurJson(500, "erreur_interne", e instanceof Error ? e.message : "Erreur interne");
    } finally {
      loggerApi(req, ctx, statut, performance.now() - debut).catch(() => {});
    }
  };
}
