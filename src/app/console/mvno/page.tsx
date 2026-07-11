import { pool } from "@/lib/db";
import { changerForfait } from "@/lib/actions";
import { Carte, CarteStat, EnTetePage, BadgeStatut, CHAMP, BOUTON_DISCRET } from "@/components/ui";

export const dynamic = "force-dynamic";

function fmtInclus(inclus: Record<string, unknown>) {
  return Object.entries(inclus).map(([k, v]) => `${k}: ${v === -1 ? "illimité" : v === true ? "oui" : v}`);
}

export default async function PageMvno() {
  const [plans, abos] = await Promise.all([
    pool.query(`SELECT p.*, (SELECT COUNT(*) FROM abonnements a WHERE a.plan_id = p.id) AS abonnes
      FROM plans_tarifaires p ORDER BY p.prix_mensuel`),
    pool.query(`SELECT a.*, t.nom AS tenant, p.nom AS plan FROM abonnements a
      JOIN tenants t ON t.id = a.tenant_id JOIN plans_tarifaires p ON p.id = a.plan_id ORDER BY a.id`),
  ]);

  return (
    <div>
      <EnTetePage
        rf="RF-020"
        titre="Interface d'Administration MVNO"
        sousTitre="Gestion des offres, des profils abonnés et des changements de forfaits (RF-020)"
        couleur="amber"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <CarteStat libelle="Offres au catalogue" valeur={plans.rows.length} couleur="amber" />
        <CarteStat libelle="Profils abonnés" valeur={abos.rows.length} couleur="sky" />
        <CarteStat
          libelle="Revenu mensuel récurrent"
          valeur={`${abos.rows.reduce((s, a) => {
            const p = plans.rows.find((pl) => pl.nom === a.plan);
            return s + Number(p?.prix_mensuel ?? 0);
          }, 0).toFixed(2)} $`}
          couleur="emerald"
        />
      </div>

      <h2 className="font-bold text-white mb-3">Catalogue des offres</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {plans.rows.map((p) => (
          <Carte key={p.id} className={p.nom === "Enterprise MVNO" ? "border-amber-500/40" : ""}>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">{p.nom}</h3>
              <span className="ml-auto text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">
                {p.type}
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-200 mt-2">
              {Number(p.prix_mensuel).toFixed(0)} $<span className="text-xs text-slate-500 font-normal">/mois</span>
            </div>
            <ul className="mt-3 space-y-1">
              {fmtInclus(p.inclus).map((l) => (
                <li key={l} className="text-xs text-slate-300 flex gap-1.5">
                  <span className="text-emerald-400">✔</span> {l}
                </li>
              ))}
            </ul>
            <div className="text-[11px] text-slate-500 mt-3">{p.abonnes} abonné(s)</div>
          </Carte>
        ))}
      </div>

      <h2 className="font-bold text-white mb-3">Profils abonnés — changement de forfait</h2>
      <div className="space-y-2">
        {abos.rows.map((a) => (
          <Carte key={a.id}>
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <div className="text-sm font-semibold text-slate-100">{a.tenant}</div>
                <div className="text-xs text-slate-500">
                  Plan actuel : <span className="text-amber-300">{a.plan}</span> · mode {a.mode}
                  {a.mode === "prepaye" && ` · solde ${Number(a.solde).toFixed(2)} $`}
                </div>
              </div>
              <span className="ml-auto"><BadgeStatut statut={a.statut} /></span>
              <form action={changerForfait} className="flex items-center gap-2">
                <input type="hidden" name="abonnement_id" value={a.id} />
                <select name="plan_id" className={`${CHAMP} w-44 py-1 text-xs`} defaultValue="">
                  <option value="" disabled>Nouveau forfait…</option>
                  {plans.rows.filter((p) => p.nom !== a.plan).map((p) => (
                    <option key={p.id} value={p.id}>{p.nom} ({Number(p.prix_mensuel).toFixed(0)} $)</option>
                  ))}
                </select>
                <button className={BOUTON_DISCRET}>Changer</button>
              </form>
            </div>
          </Carte>
        ))}
      </div>
    </div>
  );
}
