import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { routeApi, erreurJson, type ContexteApi } from "@/lib/api-auth";
import { appelerViaPasserelle } from "@/lib/gateway";

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
  let corps: { de?: string; vers?: string; type?: string; message?: string };
  try {
    corps = await req.json();
  } catch {
    return erreurJson(400, "json_invalide", "Le corps de la requête doit être du JSON valide.");
  }
  const {
    de = "+243815550000",
    vers,
    type = "standard",
    message = "Bonjour, ceci est un appel de la plateforme OmniComm 360.",
  } = corps;
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

  // Appel réel via Twilio Voice en production ; sinon statut « simule ».
  const passerelle =
    ctx.environnement === "production"
      ? await appelerViaPasserelle(vers, message)
      : ({ mode: "demo", raison: "Clé sandbox : aucun appel physique" } as const);
  const reel = passerelle.mode === "reel";
  const statut = reel ? (passerelle.statut === "envoye" ? "en_cours" : "echoue") : "simule";

  const r = await pool.query(
    `INSERT INTO appels (tenant_id, direction, de, vers, statut, type, duree_secondes, mos_score, attestation_stir, cout, mode_envoi, fournisseur_id, erreur)
     VALUES ($1,'sortant',$2,$3,$4,$5,0,NULL,'A',0,$6,$7,$8)
     RETURNING id, de, vers, statut, type, duree_secondes, attestation_stir, cout, mode_envoi, fournisseur_id, erreur, created_at`,
    [
      ctx.tenantId, de, vers, statut, type,
      reel ? "reel" : "demo",
      reel ? passerelle.fournisseurId : null,
      reel ? passerelle.erreur : passerelle.raison,
    ]
  );
  // CDR seulement si l'appel est réellement établi — durée et coût réels remontent
  // ensuite par webhook Twilio (RF-023).
  if (reel && passerelle.statut === "envoye") {
    await pool.query(
      `INSERT INTO cdrs (tenant_id, type, source, destination, duree_secondes, cout, operateur, pays_destination)
       VALUES ($1,'voix',$2,$3,0,0,$4,$5)`,
      [ctx.tenantId, de, vers, rt?.operateur ?? null, rt?.pays ?? null]
    );
  }
  return NextResponse.json(
    {
      donnees: r.rows[0],
      mode: passerelle.mode,
      ...(reel
        ? {}
        : {
            avertissement:
              "AUCUN APPEL PHYSIQUE. Enregistrement en base uniquement (statut « simule »). Configurez TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN et TWILIO_PHONE_NUMBER pour les appels réels.",
          }),
    },
    { status: 201 }
  );
});
