import { pool } from "@/lib/db";
import { Carte, CarteStat, EnTetePage } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PageAnalytics() {
  const [global, parCanal, parDest, mos] = await Promise.all([
    pool.query(`SELECT
      (SELECT COUNT(*) FROM messages) AS messages,
      (SELECT COUNT(*) FILTER (WHERE statut = 'livre') * 100.0 / NULLIF(COUNT(*),0) FROM messages)::numeric(5,1) AS taux,
      (SELECT COALESCE(ROUND(AVG(mos_score),2),0) FROM appels WHERE mos_score IS NOT NULL) AS mos,
      (SELECT COALESCE(SUM(cout),0)::numeric(12,2) FROM cdrs) AS cout_total`),
    pool.query(`SELECT canal, COUNT(*) AS n,
      COUNT(*) FILTER (WHERE statut = 'livre') * 100.0 / NULLIF(COUNT(*),0) AS taux,
      COALESCE(SUM(cout),0)::numeric(10,4) AS cout
      FROM messages GROUP BY canal ORDER BY n DESC`),
    pool.query(`SELECT COALESCE(pays_destination,'Autres') AS pays, COUNT(*) AS n,
      COALESCE(SUM(cout),0)::numeric(10,4) AS cout,
      COALESCE(AVG(cout),0)::numeric(10,5) AS cout_moyen
      FROM cdrs GROUP BY 1 ORDER BY cout DESC LIMIT 8`),
    pool.query(`SELECT
      COUNT(*) FILTER (WHERE mos_score >= 4.3) AS excellent,
      COUNT(*) FILTER (WHERE mos_score >= 4.0 AND mos_score < 4.3) AS bon,
      COUNT(*) FILTER (WHERE mos_score >= 3.6 AND mos_score < 4.0) AS correct,
      COUNT(*) FILTER (WHERE mos_score < 3.6) AS mediocre
      FROM appels WHERE mos_score IS NOT NULL`),
  ]);
  const g = global.rows[0];
  const m = mos.rows[0];
  const totalMos = Number(m.excellent) + Number(m.bon) + Number(m.correct) + Number(m.mediocre);
  const maxCanal = Math.max(1, ...parCanal.rows.map((c) => Number(c.n)));

  return (
    <div>
      <EnTetePage
        rf="RF-022"
        titre="Analyses Détaillées (Analytics)"
        sousTitre="MOS voix, taux de livraison, coût par destination (RF-022)"
        couleur="cyan"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CarteStat libelle="Messages analysés" valeur={g.messages} couleur="cyan" />
        <CarteStat libelle="Taux de livraison global" valeur={`${g.taux}%`} couleur="emerald" />
        <CarteStat libelle="MOS moyen (voix)" valeur={g.mos} detail="Mean Opinion Score / 5" couleur="violet" />
        <CarteStat libelle="Coût total mesuré" valeur={`${g.cout_total} $`} couleur="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Carte>
          <h2 className="font-bold text-white mb-3">Volumes et livraison par canal</h2>
          <ul className="space-y-2">
            {parCanal.rows.map((c) => (
              <li key={c.canal} className="border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">
                <div className="flex items-center text-sm">
                  <span className="font-mono text-xs uppercase text-cyan-300 w-20">{c.canal}</span>
                  <span className="text-slate-300">{c.n} messages</span>
                  <span className="ml-auto text-emerald-300 text-xs">{Number(c.taux ?? 0).toFixed(1)}% livrés</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#131f3a] overflow-hidden mt-1.5">
                  <div className="h-full bg-cyan-400/70" style={{ width: `${(Number(c.n) / maxCanal) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Carte>

        <Carte>
          <h2 className="font-bold text-white mb-3">Qualité voix (répartition MOS)</h2>
          <ul className="space-y-2">
            {[
              ["Excellente (≥ 4,3)", m.excellent, "bg-emerald-400/80"],
              ["Bonne (4,0 – 4,3)", m.bon, "bg-sky-400/80"],
              ["Correcte (3,6 – 4,0)", m.correct, "bg-amber-400/80"],
              ["Médiocre (< 3,6)", m.mediocre, "bg-rose-400/80"],
            ].map(([l, v, cl]) => (
              <li key={l as string} className="border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">
                <div className="flex items-center text-sm">
                  <span className="text-slate-300">{l}</span>
                  <span className="ml-auto text-slate-200 font-semibold">{v} appels</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#131f3a] overflow-hidden mt-1.5">
                  <div className={`h-full ${cl}`} style={{ width: `${totalMos ? (Number(v) / totalMos) * 100 : 0}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Carte>
      </div>

      <Carte>
        <h2 className="font-bold text-white mb-3">Coût par destination</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1c2a4a] text-left">
                {["Destination", "Volume", "Coût total", "Coût moyen / unité"].map((h) => (
                  <th key={h} className="px-3 py-2 text-xs uppercase text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parDest.rows.map((d) => (
                <tr key={d.pays} className="border-b border-[#131f3a]">
                  <td className="px-3 py-2 text-slate-200">{d.pays}</td>
                  <td className="px-3 py-2 text-slate-300">{d.n} CDR</td>
                  <td className="px-3 py-2 text-amber-200">{Number(d.cout).toFixed(4)} $</td>
                  <td className="px-3 py-2 text-slate-400">{Number(d.cout_moyen).toFixed(5)} $</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Carte>
    </div>
  );
}
