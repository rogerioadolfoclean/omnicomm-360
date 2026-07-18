import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pool } from "@/lib/db";
import { urlWebhookStatut } from "@/lib/gateway";

export const dynamic = "force-dynamic";

/** Traduit le statut Twilio vers le statut interne OmniComm. */
function mapStatut(twilio: string): string | null {
  switch (twilio) {
    case "delivered":
      return "livre";
    case "sent":
    case "queued":
    case "sending":
    case "accepted":
      return "envoye";
    case "undelivered":
    case "failed":
      return "echoue";
    default:
      return null;
  }
}

/** Vérifie la signature X-Twilio-Signature (authenticité du rappel). */
function signatureValide(signature: string | null, params: Record<string, string>): boolean {
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!signature || !token) return false;
  // Twilio signe : URL du callback + chaque paramètre POST trié par clé (clé+valeur).
  const data = Object.keys(params)
    .sort()
    .reduce((acc, k) => acc + k + params[k], urlWebhookStatut());
  const attendu = crypto.createHmac("sha1", token).update(Buffer.from(data, "utf-8")).digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(attendu), Buffer.from(signature));
  } catch {
    return false;
  }
}

/**
 * Webhook de statut de livraison Twilio (RF-021, RF-023).
 * Twilio appelle cette URL à chaque changement d'état d'un SMS ou d'un appel :
 * la console reflète alors « livré » / « échoué » automatiquement, en temps réel.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) params[k] = String(v);

  const signature = req.headers.get("x-twilio-signature");
  if (!signatureValide(signature, params)) {
    // Rappel non authentifié : on refuse (protège contre les faux statuts).
    return new NextResponse("Signature invalide", { status: 403 });
  }

  const sid = params.MessageSid ?? params.SmsSid ?? params.CallSid ?? null;
  const statutTwilio = params.MessageStatus ?? params.SmsStatus ?? params.CallStatus ?? "";
  const erreurCode = params.ErrorCode ? `Twilio erreur ${params.ErrorCode}` : null;

  if (sid) {
    // Message ?
    if (params.MessageSid || params.SmsSid) {
      const statut = mapStatut(statutTwilio);
      if (statut) {
        await pool.query(
          `UPDATE messages SET
             statut = $1::text,
             delivered_at = CASE WHEN $1::text = 'livre' THEN NOW() ELSE delivered_at END,
             erreur = CASE WHEN $1::text = 'echoue' THEN COALESCE($2::text, 'Échec opérateur') ELSE erreur END
           WHERE fournisseur_id = $3::text`,
          [statut, erreurCode, sid]
        );
      }
    }
    // Appel ?
    if (params.CallSid) {
      const statutAppel =
        statutTwilio === "completed"
          ? "termine"
          : statutTwilio === "in-progress"
            ? "en_cours"
            : statutTwilio === "ringing"
              ? "sonnerie"
              : ["busy", "failed", "canceled"].includes(statutTwilio)
                ? "echoue"
                : statutTwilio === "no-answer"
                  ? "sans_reponse"
                  : null;
      const duree = params.CallDuration ? Number(params.CallDuration) : 0;
      if (statutAppel) {
        await pool.query(
          `UPDATE appels SET statut = $1::text, duree_secondes = GREATEST(duree_secondes, $2::int)
           WHERE fournisseur_id = $3::text`,
          [statutAppel, duree, sid]
        );
      }
    }
  }

  // Twilio attend une réponse 2xx (corps vide accepté).
  return new NextResponse(null, { status: 200 });
}
