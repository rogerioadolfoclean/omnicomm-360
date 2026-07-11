import { pool } from "@/lib/db";
import { Carte, CarteStat, EnTetePage, Tableau } from "@/components/ui";

export const dynamic = "force-dynamic";

const NIVEAUX: Record<string, { libelle: string; couleur: string }> = {
  A: { libelle: "Attestation complète — appelant et numéro vérifiés", couleur: "text-emerald-300" },
  B: { libelle: "Attestation partielle — client connu, numéro non vérifié", couleur: "text-amber-300" },
  C: { libelle: "Attestation passerelle — origine non vérifiable", couleur: "text-rose-300" },
};

export default async function PageStir() {
  const [rep, suspects] = await Promise.all([
    pool.query(`SELECT attestation_stir AS a, COUNT(*) AS n FROM appels WHERE attestation_stir IS NOT NULL GROUP BY 1 ORDER BY 1`),
    pool.query(`SELECT * FROM alertes_fraude WHERE type = 'spoofing' ORDER BY created_at DESC LIMIT 5`),
  ]);
  const total = rep.rows.reduce((s, r) => s + Number(r.n), 0);
  const parNiveau = Object.fromEntries(rep.rows.map((r) => [r.a, Number(r.n)]));

  return (
    <div>
      <EnTetePage
        rf="RF-011"
        titre="STIR/SHAKEN — Authentification Anti-Spoofing"
        sousTitre="Signature cryptographique de l'identité de l'appelant sur chaque appel sortant (RF-011)"
        couleur="violet"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CarteStat libelle="Appels signés" valeur={total} couleur="violet" />
        <CarteStat libelle="Attestation A" valeur={parNiveau.A ?? 0} detail={total ? `${Math.round(((parNiveau.A ?? 0) / total) * 100)}% du trafic` : ""} couleur="emerald" />
        <CarteStat libelle="Attestation B" valeur={parNiveau.B ?? 0} couleur="amber" />
        <CarteStat libelle="Attestation C" valeur={parNiveau.C ?? 0} detail="surveillées par l'anti-fraude" couleur="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Carte>
          <h2 className="font-bold text-white mb-3">Niveaux d&apos;attestation</h2>
          <ul className="space-y-2">
            {Object.entries(NIVEAUX).map(([k, v]) => (
              <li key={k} className="flex items-start gap-3 border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">
                <span className={`font-bold text-lg ${v.couleur}`}>{k}</span>
                <div>
                  <div className="text-sm text-slate-200">{v.libelle}</div>
                  <div className="text-xs text-slate-500">
                    {parNiveau[k] ?? 0} appels ({total ? Math.round(((parNiveau[k] ?? 0) / total) * 100) : 0}%)
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Carte>
        <Carte>
          <h2 className="font-bold text-white mb-3">Comment ça marche</h2>
          <ol className="text-sm text-slate-300 space-y-2">
            {[
              "1. L'appel sortant est intercepté par le Moteur de Sécurité.",
              "2. La plateforme signe l'identité (certificat STI-AS, clé privée).",
              "3. L'en-tête SIP Identity transporte le jeton PASSporT signé.",
              "4. L'opérateur de terminaison vérifie la signature (STI-VS).",
              "5. Les appels non signés ou C sont scorés par l'anti-fraude (RF-024).",
            ].map((e) => (
              <li key={e} className="border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">{e}</li>
            ))}
          </ol>
        </Carte>
      </div>

      <h2 className="font-bold text-white mb-3">Tentatives de spoofing détectées</h2>
      <Tableau
        entetes={["Gravité", "Score", "Description", "Statut", "Date"]}
        lignes={suspects.rows.map((a) => [
          <span key="g" className="text-xs uppercase text-rose-300">{a.gravite}</span>,
          <span key="sc" className="font-bold text-amber-300">{a.score}/100</span>,
          <span key="d" className="text-xs text-slate-300 max-w-md whitespace-normal inline-block">{a.description}</span>,
          <span key="s" className="text-xs text-slate-400">{a.statut}</span>,
          <span key="dt" className="text-xs text-slate-500">{new Date(a.created_at).toLocaleString("fr-FR")}</span>,
        ])}
      />
    </div>
  );
}
