import { pool } from "@/lib/db";
import { majAlerteFraude } from "@/lib/actions";
import { Carte, CarteStat, EnTetePage, BadgeStatut, BOUTON_DISCRET } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PageAntiFraude() {
  const [alertes, stats] = await Promise.all([
    pool.query(`SELECT a.*, t.nom AS tenant FROM alertes_fraude a
      LEFT JOIN tenants t ON t.id = a.tenant_id ORDER BY
      CASE a.statut WHEN 'nouvelle' THEN 0 WHEN 'en_cours' THEN 1 ELSE 2 END, a.score DESC`),
    pool.query(`SELECT COUNT(*) AS total,
      COUNT(*) FILTER (WHERE statut = 'nouvelle') AS nouvelles,
      COUNT(*) FILTER (WHERE type = 'sim_box') AS sim_box,
      COALESCE(MAX(score) FILTER (WHERE statut IN ('nouvelle','en_cours')),0) AS score_max
      FROM alertes_fraude`),
  ]);
  const s = stats.rows[0];

  return (
    <div>
      <EnTetePage
        rf="RF-024"
        titre="Détection Active des Fraudes"
        sousTitre="Moteur anti-fraude temps réel : SIM Box, appels frauduleux, clonage (RF-024)"
        couleur="cyan"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CarteStat libelle="Alertes totales" valeur={s.total} couleur="cyan" />
        <CarteStat libelle="Nouvelles (à traiter)" valeur={s.nouvelles} couleur="sky" />
        <CarteStat libelle="Détections SIM Box" valeur={s.sim_box} couleur="violet" />
        <CarteStat libelle="Score de risque max" valeur={`${s.score_max}/100`} couleur="amber" />
      </div>

      <Carte className="mb-6">
        <h2 className="font-bold text-white mb-2">Signaux surveillés par le Moteur de Sécurité</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 text-sm">
          {[
            ["SIM Box (bypass)", "Appels internationaux terminés localement, séquences d'appels réguliers, immobilité des SIM, IMEI partagés."],
            ["Spoofing d'appelant", "Numéros présentés sans attestation STIR/SHAKEN A, incohérence route/CLI."],
            ["Clonage de SIM", "Même IMSI vu sur des cellules géographiquement incompatibles."],
            ["Trafic anormal", "Écart au profil historique (volume, horaires, destinations premium)."],
          ].map(([t, d]) => (
            <div key={t} className="border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">
              <div className="text-cyan-300 font-semibold text-xs">{t}</div>
              <div className="text-xs text-slate-400 mt-1">{d}</div>
            </div>
          ))}
        </div>
      </Carte>

      <h2 className="font-bold text-white mb-3">Alertes de fraude</h2>
      <div className="space-y-2">
        {alertes.rows.map((a) => (
          <Carte key={a.id} className={a.gravite === "critique" ? "border-rose-500/50" : ""}>
            <div className="flex items-center gap-2 flex-wrap">
              <BadgeStatut statut={a.gravite} />
              <span className="text-xs font-mono uppercase text-slate-400">{a.type}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-24 h-1.5 rounded-full bg-[#131f3a] overflow-hidden">
                  <div
                    className={`h-full ${a.score >= 80 ? "bg-rose-400" : a.score >= 50 ? "bg-amber-400" : "bg-sky-400"}`}
                    style={{ width: `${a.score}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-500">{a.score}/100</span>
              </div>
              <span className="ml-auto"><BadgeStatut statut={a.statut} /></span>
            </div>
            <p className="text-sm text-slate-300 mt-2">{a.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-500">
                {a.tenant ?? "Plateforme"} · {new Date(a.created_at).toLocaleString("fr-FR")}
              </span>
              <div className="ml-auto flex gap-2">
                {a.statut === "nouvelle" && (
                  <form action={majAlerteFraude}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="statut" value="en_cours" />
                    <button className={BOUTON_DISCRET}>Prendre en charge</button>
                  </form>
                )}
                {["nouvelle", "en_cours"].includes(a.statut) && (
                  <>
                    <form action={majAlerteFraude}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="statut" value="resolue" />
                      <button className={BOUTON_DISCRET}>Résolue</button>
                    </form>
                    <form action={majAlerteFraude}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="statut" value="faux_positif" />
                      <button className={BOUTON_DISCRET}>Faux positif</button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </Carte>
        ))}
      </div>
    </div>
  );
}
