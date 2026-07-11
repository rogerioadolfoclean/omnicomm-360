import { pool } from "@/lib/db";
import { majAlerteFraude } from "@/lib/actions";
import { Carte, CarteStat, EnTetePage, BadgeStatut, BOUTON_DISCRET } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PageRevenue() {
  const [alertes, ecart] = await Promise.all([
    pool.query(`SELECT a.*, t.nom AS tenant FROM alertes_fraude a
      LEFT JOIN tenants t ON t.id = a.tenant_id
      WHERE a.type IN ('fuite_revenus','trafic_anormal') ORDER BY a.score DESC`),
    pool.query(`SELECT
      (SELECT COALESCE(SUM(cout),0)::numeric(12,2) FROM cdrs) AS cout_cdr,
      (SELECT COALESCE(SUM(cout),0)::numeric(12,2) FROM compteurs_usage) AS cout_facture`),
  ]);
  const e = ecart.rows[0];
  const ouvertes = alertes.rows.filter((a) => ["nouvelle", "en_cours"].includes(a.statut));

  return (
    <div>
      <EnTetePage
        rf="RF-019"
        titre="Revenue Assurance"
        sousTitre="Détection des fraudes et des fuites de revenus : rapprochement CDR ↔ facturation (RF-019)"
        couleur="amber"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CarteStat libelle="Coût mesuré (CDR)" valeur={`${e.cout_cdr} $`} couleur="sky" />
        <CarteStat libelle="Coût facturé" valeur={`${e.cout_facture} $`} couleur="amber" />
        <CarteStat libelle="Alertes ouvertes" valeur={ouvertes.length} couleur="cyan" />
        <CarteStat libelle="Contrôles automatiques" valeur="4" detail="rapprochement, marge, volumes, écarts" couleur="emerald" />
      </div>

      <Carte className="mb-6">
        <h2 className="font-bold text-white mb-2">Contrôles du moteur Revenue Assurance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 text-sm">
          {[
            ["Rapprochement CDR ↔ Factures", "Chaque CDR doit être valorisé et facturé — les écarts > 5% déclenchent une alerte."],
            ["Analyse de marge", "Coût opérateur vs prix client par destination — détection des routes déficitaires."],
            ["Surveillance des volumes", "Comparaison au profil historique du tenant (jour/heure) — pics anormaux signalés."],
            ["Détection des fuites", "Trafic non facturé, sessions RADIUS orphelines, minutes fantômes."],
          ].map(([t, d]) => (
            <div key={t} className="border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">
              <div className="text-amber-300 font-semibold text-xs">{t}</div>
              <div className="text-xs text-slate-400 mt-1">{d}</div>
            </div>
          ))}
        </div>
      </Carte>

      <h2 className="font-bold text-white mb-3">Alertes revenus & trafic</h2>
      <div className="space-y-2">
        {alertes.rows.map((a) => (
          <Carte key={a.id}>
            <div className="flex items-center gap-2 flex-wrap">
              <BadgeStatut statut={a.gravite} />
              <span className="text-xs font-mono text-slate-400">{a.type}</span>
              <span className="text-xs text-slate-500">score {a.score}/100 · {a.tenant ?? "plateforme"}</span>
              <span className="ml-auto"><BadgeStatut statut={a.statut} /></span>
            </div>
            <p className="text-sm text-slate-300 mt-2">{a.description}</p>
            <div className="flex gap-2 mt-2">
              {a.statut !== "en_cours" && a.statut !== "resolue" && (
                <form action={majAlerteFraude}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="statut" value="en_cours" />
                  <button className={BOUTON_DISCRET}>Prendre en charge</button>
                </form>
              )}
              {a.statut !== "resolue" && (
                <form action={majAlerteFraude}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="statut" value="resolue" />
                  <button className={BOUTON_DISCRET}>Marquer résolue</button>
                </form>
              )}
            </div>
          </Carte>
        ))}
      </div>
    </div>
  );
}
