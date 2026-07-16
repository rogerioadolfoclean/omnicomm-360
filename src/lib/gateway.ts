import "server-only";

/**
 * Passerelle opérateur réelle (RF-001, RF-002).
 * Si les variables TWILIO_* sont configurées, les SMS et WhatsApp partent
 * réellement via Twilio ; sinon la plateforme reste en mode démonstration
 * (enregistrement réel en base, sans envoi physique).
 */
export type ResultatPasserelle =
  | { mode: "demo" }
  | { mode: "reel"; statut: "envoye" | "echoue"; fournisseurId: string | null; erreur: string | null };

export function passerelleConfiguree(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
  );
}

export async function envoyerViaPasserelle(
  canal: string,
  vers: string,
  contenu: string
): Promise<ResultatPasserelle> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const numero = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !numero || !["sms", "whatsapp"].includes(canal)) {
    return { mode: "demo" };
  }

  const corps = new URLSearchParams({
    To: canal === "whatsapp" ? `whatsapp:${vers}` : vers,
    From: canal === "whatsapp" ? `whatsapp:${numero}` : numero,
    Body: contenu,
  });

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: corps,
      }
    );
    const json = (await res.json()) as { sid?: string; message?: string };
    if (!res.ok) {
      return {
        mode: "reel",
        statut: "echoue",
        fournisseurId: null,
        erreur: `Twilio ${res.status} : ${json.message ?? "erreur inconnue"}`,
      };
    }
    return { mode: "reel", statut: "envoye", fournisseurId: json.sid ?? null, erreur: null };
  } catch (e) {
    return {
      mode: "reel",
      statut: "echoue",
      fournisseurId: null,
      erreur: e instanceof Error ? e.message : "Passerelle injoignable",
    };
  }
}
