import { pool } from "@/lib/db";
import { exigerSession } from "@/lib/auth";
import { etatPasserelle } from "@/lib/gateway";
import { Carte, CarteStat, EnTetePage, BadgeStatut, Tableau } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PagePasserelle() {
  await exigerSession();
  const etat = etatPasserelle();

  const [stats, derniers, routes] = await Promise.all([
    pool.query(`SELECT
      COUNT(*) FILTER (WHERE mode_envoi = 'reel') AS reels,
      COUNT(*) FILTER (WHERE statut = 'simule') AS simules,
      COUNT(*) FILTER (WHERE statut = 'echoue') AS echoues
      FROM messages`),
    pool.query(`SELECT canal, vers, statut, mode_envoi, fournisseur_id, erreur, pays_destination, created_at
      FROM messages ORDER BY created_at DESC LIMIT 10`),
    pool.query(`SELECT DISTINCT pays, prefixe FROM routes_tarifs WHERE actif ORDER BY pays`),
  ]);
  const s = stats.rows[0];

  const variables = [
    { nom: "TWILIO_ACCOUNT_SID", present: etat.sid, exemple: "AC…", role: "Identifiant du compte Twilio" },
    { nom: "TWILIO_AUTH_TOKEN", present: etat.token, exemple: "(secret)", role: "Jeton d'authentification" },
    { nom: "TWILIO_PHONE_NUMBER", present: etat.numero, exemple: "+1…", role: "Numéro émetteur acheté chez Twilio" },
  ];

  return (
    <div>
      <EnTetePage
        titre="Passerelle opérateur — diagnostic"
        sousTitre="État de la connexion aux réseaux télécoms réels (SMS, WhatsApp, Voix)"
        couleur={etat.configuree ? "emerald" : "amber"}
      />

      {etat.configuree ? (
        <div className="mb-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
          <div className="text-emerald-300 font-bold">● PASSERELLE ACTIVE — les envois sont réels</div>
          <p className="text-xs text-emerald-100/80 mt-1">
            Numéro émetteur : <span className="font-mono">{etat.numeroAffiche}</span> · canaux réels :{" "}
            {etat.canauxReels.join(", ")}
          </p>
        </div>
      ) : (
        <div className="mb-6 rounded-lg border-2 border-orange-500/50 bg-orange-500/10 px-4 py-3">
          <div className="text-orange-300 font-bold">⚠ PASSERELLE NON CONFIGURÉE — mode démonstration</div>
          <p className="text-xs text-orange-100/80 mt-1">
            Tout fonctionne (routage, DND, facturation, CDR, API) sauf l&apos;émission physique. Les messages portent le
            statut « simulé » et aucun SMS ni appel n&apos;atteint le destinataire.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CarteStat libelle="Envois réels" valeur={s.reels} detail="passés par un opérateur" couleur="emerald" />
        <CarteStat libelle="Simulés (non envoyés)" valeur={s.simules} detail="mode démonstration" couleur="amber" />
        <CarteStat libelle="Échecs passerelle" valeur={s.echoues} couleur="cyan" />
        <CarteStat libelle="Pays routables" valeur={routes.rows.length} detail="catalogue Least-Cost" couleur="sky" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Carte>
          <h2 className="font-bold text-white mb-3">Variables d&apos;environnement requises</h2>
          <ul className="space-y-2">
            {variables.map((v) => (
              <li key={v.nom} className="flex items-center gap-3 border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">
                <span className={v.present ? "text-emerald-400" : "text-rose-400"}>{v.present ? "✔" : "✘"}</span>
                <div className="min-w-0">
                  <div className="font-mono text-xs text-slate-100">{v.nom}</div>
                  <div className="text-[11px] text-slate-500">{v.role}</div>
                </div>
                <span className={`ml-auto text-[11px] font-semibold ${v.present ? "text-emerald-300" : "text-rose-300"}`}>
                  {v.present ? "configurée" : "manquante"}
                </span>
              </li>
            ))}
          </ul>
        </Carte>

        <Carte>
          <h2 className="font-bold text-white mb-3">Activer les envois réels</h2>
          <ol className="text-sm text-slate-300 space-y-2">
            {[
              "1. Créer un compte sur twilio.com et acheter un numéro émetteur.",
              "2. Relever Account SID et Auth Token dans la console Twilio.",
              "3. Autoriser la RDC (+243) et l'Angola (+244) dans Messaging → Geo Permissions.",
              "4. Ajouter les 3 variables dans Vercel (Settings → Environment Variables).",
              "5. Redéployer : les statuts passent de « simulé » à « envoyé » puis « livré ».",
            ].map((e) => (
              <li key={e} className="border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120] text-xs">
                {e}
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-amber-300/80 mt-3">
            Compte d&apos;essai Twilio : l&apos;envoi n&apos;est possible que vers des numéros vérifiés et le message est
            préfixé d&apos;une mention d&apos;essai. Un compte payant lève ces limites.
          </p>
        </Carte>
      </div>

      <h2 className="font-bold text-white mb-3">Derniers envois — mode réel ou simulé</h2>
      <Tableau
        entetes={["Canal", "Destinataire", "Pays", "Statut", "Mode", "ID fournisseur", "Détail", "Date"]}
        lignes={derniers.rows.map((m) => [
          <span key="c" className="font-mono text-xs uppercase text-sky-300">{m.canal}</span>,
          <span key="v" className="text-slate-200">{m.vers}</span>,
          <span key="p" className="text-xs text-slate-400">{m.pays_destination ?? "—"}</span>,
          <BadgeStatut key="s" statut={m.statut} />,
          <span key="m" className={`text-xs font-bold ${m.mode_envoi === "reel" ? "text-emerald-300" : "text-orange-300"}`}>
            {m.mode_envoi === "reel" ? "RÉEL" : "DÉMO"}
          </span>,
          <span key="f" className="font-mono text-[11px] text-slate-500">{m.fournisseur_id ?? "—"}</span>,
          <span key="e" className="text-[11px] text-slate-500 max-w-64 truncate inline-block" title={m.erreur ?? ""}>
            {m.erreur ?? "—"}
          </span>,
          <span key="d" className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString("fr-FR")}</span>,
        ])}
      />
    </div>
  );
}
