import { pool } from "@/lib/db";
import { lancerAppel } from "@/lib/actions";
import { Carte, CarteStat, EnTetePage, BadgeStatut, Tableau, CHAMP, BOUTON } from "@/components/ui";

export const dynamic = "force-dynamic";

function fmtDuree(s: number) {
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default async function PageAppels() {
  const [stats, appels, ivrs, confs] = await Promise.all([
    pool.query(`SELECT COUNT(*) AS total,
      COUNT(*) FILTER (WHERE direction = 'entrant') AS entrants,
      COUNT(*) FILTER (WHERE direction = 'sortant') AS sortants,
      COALESCE(SUM(duree_secondes),0) AS duree,
      COALESCE(ROUND(AVG(mos_score),2),0) AS mos
      FROM appels`),
    pool.query(`SELECT * FROM appels ORDER BY created_at DESC LIMIT 15`),
    pool.query(`SELECT * FROM ivr_flows ORDER BY id`),
    pool.query(`SELECT * FROM conferences ORDER BY created_at DESC LIMIT 5`),
  ]);
  const s = stats.rows[0];

  return (
    <div>
      <EnTetePage
        rf="RF-007"
        titre="Appels Entrants/Sortants, IVR, Conférence"
        sousTitre="API voix : appels, serveurs vocaux interactifs (SVI), conférence audio et boîte vocale (RF-007)"
        couleur="violet"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CarteStat libelle="Appels totaux" valeur={s.total} couleur="violet" />
        <CarteStat libelle="Entrants / Sortants" valeur={`${s.entrants} / ${s.sortants}`} couleur="sky" />
        <CarteStat libelle="Minutes cumulées" valeur={Math.round(Number(s.duree) / 60)} couleur="emerald" />
        <CarteStat libelle="MOS moyen (qualité)" valeur={s.mos} detail="échelle 1 à 5" couleur="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Carte className="lg:col-span-1">
          <h2 className="font-bold text-white mb-3">Lancer un appel sortant</h2>
          <form action={lancerAppel} className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Numéro appelant</label>
              <input name="de" defaultValue="+243815550000" className={CHAMP} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Numéro appelé</label>
              <input name="vers" required placeholder="+243811234567" className={CHAMP} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Type d&apos;appel</label>
              <select name="type" className={CHAMP}>
                <option value="standard">Standard</option>
                <option value="ivr">IVR / SVI</option>
                <option value="conference">Conférence</option>
                <option value="ia">Agent IA</option>
                <option value="webrtc">WebRTC (navigateur)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Message vocal (lu au décroché)</label>
              <textarea
                name="message"
                rows={2}
                defaultValue="Bonjour, ceci est un appel de la plateforme OmniComm 360."
                className={CHAMP}
              />
            </div>
            <button className={BOUTON}>Appeler →</button>
            <p className="text-[11px] text-slate-500">
              Routage Least-Cost et signature STIR/SHAKEN appliqués. L&apos;appel n&apos;est réellement émis que si la
              passerelle opérateur est configurée ; sinon il est enregistré au statut « simulé ».
            </p>
          </form>
        </Carte>

        <Carte>
          <h2 className="font-bold text-white mb-3">Serveurs vocaux (IVR / SVI)</h2>
          <ul className="space-y-2">
            {ivrs.rows.map((f) => (
              <li key={f.id} className="border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">
                <div className="text-sm text-slate-100 font-semibold">{f.nom}</div>
                <div className="text-xs text-slate-500">{f.description}</div>
                <div className="text-[11px] font-mono text-violet-300 mt-1">
                  {(f.config.etapes ?? []).map((e: { type: string }) => e.type).join(" → ")}
                </div>
              </li>
            ))}
          </ul>
        </Carte>

        <Carte>
          <h2 className="font-bold text-white mb-3">Conférences audio</h2>
          <ul className="space-y-2">
            {confs.rows.map((c) => (
              <li key={c.id} className="border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-100">{c.nom}</span>
                  <span className="ml-auto"><BadgeStatut statut={c.statut} /></span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {c.participants} participants · {c.duree_minutes} min
                </div>
              </li>
            ))}
          </ul>
        </Carte>
      </div>

      <h2 className="font-bold text-white mb-3">Journal des appels</h2>
      <Tableau
        entetes={["Direction", "De", "Vers", "Type", "Durée", "MOS", "STIR", "Coût", "Statut", "Date"]}
        lignes={appels.rows.map((a) => [
          <span key="d" className="text-xs text-slate-300">{a.direction}</span>,
          <span key="de" className="text-slate-200">{a.de}</span>,
          <span key="v" className="text-slate-200">{a.vers}</span>,
          <span key="t" className="text-xs font-mono text-violet-300">{a.type}</span>,
          <span key="du" className="text-xs text-slate-400">{fmtDuree(a.duree_secondes)}</span>,
          <span key="m" className="text-xs text-emerald-300">{a.mos_score ?? "—"}</span>,
          <span key="st" className="text-xs font-bold text-sky-300">{a.attestation_stir ?? "—"}</span>,
          <span key="c" className="text-xs text-amber-200">{Number(a.cout).toFixed(4)} $</span>,
          <BadgeStatut key="s" statut={a.statut} />,
          <span key="dt" className="text-xs text-slate-500">{new Date(a.created_at).toLocaleString("fr-FR")}</span>,
        ])}
      />
    </div>
  );
}
