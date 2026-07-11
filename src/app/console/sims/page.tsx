import { pool } from "@/lib/db";
import { changerStatutSim, diagnostiquerSim } from "@/lib/actions";
import { Carte, CarteStat, EnTetePage, BadgeStatut, Tableau, BOUTON_DISCRET } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PageSims() {
  const [sims, evenements, stats] = await Promise.all([
    pool.query(`SELECT s.*, t.nom AS tenant FROM sims s JOIN tenants t ON t.id = s.tenant_id ORDER BY s.id LIMIT 30`),
    pool.query(`SELECT e.*, s.etiquette FROM sim_evenements e JOIN sims s ON s.id = e.sim_id ORDER BY e.created_at DESC LIMIT 8`),
    pool.query(`SELECT COUNT(*) AS total,
      COUNT(*) FILTER (WHERE statut = 'active') AS actives,
      COUNT(*) FILTER (WHERE statut = 'suspendue') AS suspendues,
      COALESCE(SUM(data_mois_mo),0)::numeric(12,1) AS data
      FROM sims`),
  ]);
  const s = stats.rows[0];

  return (
    <div>
      <EnTetePage
        rf="RF-012"
        titre="Gestion des SIM M2M / IoT"
        sousTitre="Cycle de vie complet des cartes SIM : activation, suspension, diagnostic — AgriTech, Minier, Logistique (RF-012)"
        couleur="emerald"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CarteStat libelle="Parc SIM" valeur={s.total} couleur="emerald" />
        <CarteStat libelle="Actives" valeur={s.actives} couleur="sky" />
        <CarteStat libelle="Suspendues" valeur={s.suspendues} couleur="amber" />
        <CarteStat libelle="Data du mois" valeur={`${s.data} Mo`} couleur="violet" />
      </div>

      <h2 className="font-bold text-white mb-3">Parc de cartes SIM</h2>
      <Tableau
        entetes={["ICCID", "MSISDN", "Étiquette", "Secteur", "Tenant", "Data (Mo)", "Statut", "Actions"]}
        lignes={sims.rows.map((c) => [
          <span key="i" className="font-mono text-xs text-slate-400">{c.iccid}</span>,
          <span key="m" className="font-mono text-xs text-slate-200">{c.msisdn}</span>,
          <span key="e" className="text-xs text-slate-300">{c.etiquette}</span>,
          <span key="sec" className="text-xs uppercase text-emerald-300">{c.secteur}</span>,
          <span key="t" className="text-xs text-slate-400">{c.tenant}</span>,
          <span key="d" className="text-xs text-slate-300">{Number(c.data_mois_mo).toFixed(1)}</span>,
          <BadgeStatut key="s" statut={c.statut} />,
          <div key="a" className="flex gap-1.5">
            {c.statut !== "active" && (
              <form action={changerStatutSim}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="statut" value="active" />
                <button className={BOUTON_DISCRET}>Activer</button>
              </form>
            )}
            {c.statut === "active" && (
              <form action={changerStatutSim}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="statut" value="suspendue" />
                <button className={BOUTON_DISCRET}>Suspendre</button>
              </form>
            )}
            <form action={diagnostiquerSim}>
              <input type="hidden" name="id" value={c.id} />
              <button className={BOUTON_DISCRET}>Diagnostic</button>
            </form>
          </div>,
        ])}
      />

      <h2 className="font-bold text-white mt-6 mb-3">Derniers événements SIM</h2>
      <div className="space-y-2">
        {evenements.rows.map((e) => (
          <Carte key={e.id} className="py-2.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xs font-mono uppercase text-emerald-300">{e.type}</span>
              <span className="text-slate-300">{e.etiquette}</span>
              <span className="ml-auto text-xs text-slate-500">{new Date(e.created_at).toLocaleString("fr-FR")}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{e.details}</p>
          </Carte>
        ))}
      </div>
    </div>
  );
}
