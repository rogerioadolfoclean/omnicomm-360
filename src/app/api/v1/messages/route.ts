import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { routeApi, erreurJson, type ContexteApi } from "@/lib/api-auth";
import { envoyerViaPasserelle } from "@/lib/gateway";

export const dynamic = "force-dynamic";

const CANAUX = ["sms", "whatsapp", "rcs", "email", "push", "fax"];

/** GET /api/v1/messages — liste paginée des messages du tenant. */
export const GET = routeApi(async (req: NextRequest, ctx: ContexteApi) => {
  const url = new URL(req.url);
  const canal = url.searchParams.get("canal");
  const limite = Math.min(Number(url.searchParams.get("limite") ?? 20), 100);
  const r = await pool.query(
    `SELECT id, canal, direction, de, vers, sujet, contenu, statut, categorie,
            operateur_route, pays_destination, cout, erreur, created_at, delivered_at
     FROM messages WHERE tenant_id = $1 AND ($2::text IS NULL OR canal = $2)
     ORDER BY created_at DESC LIMIT $3`,
    [ctx.tenantId, canal, limite]
  );
  return NextResponse.json({ donnees: r.rows, total: r.rows.length });
});

/** POST /api/v1/messages — envoie un message omnicanal (routage Least-Cost + DND). */
export const POST = routeApi(async (req: NextRequest, ctx: ContexteApi) => {
  let corps: { canal?: string; de?: string; vers?: string; sujet?: string; contenu?: string; categorie?: string };
  try {
    corps = await req.json();
  } catch {
    return erreurJson(400, "json_invalide", "Le corps de la requête doit être du JSON valide.");
  }
  const { canal = "sms", de = "OmniComm", vers, sujet = null, contenu, categorie = "transactionnel" } = corps;
  if (!CANAUX.includes(canal)) return erreurJson(422, "canal_invalide", `Canal invalide. Valeurs : ${CANAUX.join(", ")}.`);
  if (!vers || !contenu) return erreurJson(422, "parametres_manquants", "Les champs 'vers' et 'contenu' sont obligatoires.");

  // Conformité DND (RF-006)
  const canalDnd = canal === "rcs" ? "sms" : canal;
  const optout = await pool.query(
    `SELECT 1 FROM optouts WHERE tenant_id = $1 AND canal = $2 AND identifiant = $3`,
    [ctx.tenantId, canalDnd, vers]
  );
  if (categorie === "marketing" && optout.rows.length > 0) {
    const rejet = await pool.query(
      `INSERT INTO messages (tenant_id, api_key_id, canal, de, vers, sujet, contenu, statut, categorie, erreur)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'rejete_dnd',$8,'Destinataire inscrit sur liste DND (opt-out)')
       RETURNING id, statut`,
      [ctx.tenantId, ctx.apiKeyId, canal, de, vers, sujet, contenu, categorie]
    );
    return NextResponse.json(
      { donnees: rejet.rows[0], avertissement: "Message rejeté : destinataire en opt-out (DND)." },
      { status: 201 }
    );
  }

  // Routage Least-Cost (RF-001)
  const route = await pool.query(
    `SELECT operateur, cout_par_unite, pays FROM routes_tarifs
     WHERE canal = $1 AND actif AND $2 LIKE prefixe || '%'
     ORDER BY cout_par_unite ASC, priorite ASC LIMIT 1`,
    [canal === "rcs" ? "sms" : canal, vers]
  );
  const rt = route.rows[0];

  // Passerelle réelle (Twilio) si configurée — jamais en environnement sandbox
  const passerelle =
    ctx.environnement === "production"
      ? await envoyerViaPasserelle(canal, vers, contenu)
      : ({ mode: "demo" } as const);
  const statutFinal =
    passerelle.mode === "reel"
      ? passerelle.statut
      : ctx.environnement === "sandbox"
        ? "envoye"
        : "livre";
  const operateur =
    passerelle.mode === "reel"
      ? `Twilio → ${rt?.operateur ?? "international"}`
      : rt?.operateur ?? (canal === "email" ? "SMTP direct" : canal === "push" ? "FCM" : canal === "fax" ? "FoIP Gateway" : "Route par défaut");

  const r = await pool.query(
    `INSERT INTO messages (tenant_id, api_key_id, canal, de, vers, sujet, contenu, statut, categorie, operateur_route, pays_destination, cout, erreur, delivered_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     RETURNING id, canal, de, vers, statut, operateur_route, cout, erreur, created_at`,
    [
      ctx.tenantId, ctx.apiKeyId, canal, de, vers, sujet, contenu, statutFinal, categorie,
      operateur, rt?.pays ?? null, rt?.cout_par_unite ?? 0.0002,
      passerelle.mode === "reel" ? passerelle.erreur : null,
      statutFinal === "livre" ? new Date() : null,
    ]
  );
  await pool.query(
    `INSERT INTO cdrs (tenant_id, type, source, destination, duree_secondes, cout, operateur, pays_destination)
     VALUES ($1,$2,$3,$4,0,$5,$6,$7)`,
    [ctx.tenantId, canal === "email" ? "email" : canal === "fax" ? "fax" : "sms", de, vers, rt?.cout_par_unite ?? 0.0002, rt?.operateur ?? null, rt?.pays ?? null]
  );
  return NextResponse.json(
    {
      donnees: r.rows[0],
      mode: passerelle.mode,
      ...(passerelle.mode === "demo"
        ? { note: "Mode démonstration : message enregistré et routé, sans envoi physique (configurez TWILIO_* pour l'envoi réel)." }
        : {}),
    },
    { status: 201 }
  );
});
