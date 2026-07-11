import { pool } from "@/lib/db";
import { Carte, EnTetePage } from "@/components/ui";

export const dynamic = "force-dynamic";

const COULEUR_QUALITE: Record<string, string> = {
  excellente: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  bonne: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  moyenne: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  faible: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  inexistante: "bg-rose-500/20 text-rose-300 border-rose-500/40",
};

export default async function PageCouverture() {
  const donnees = await pool.query(
    `SELECT operateur, zone, technologie, qualite, population_couverte_pct
     FROM couverture_reseau WHERE pays = 'RDC' ORDER BY operateur, zone`
  );
  const operateurs = [...new Set(donnees.rows.map((d) => d.operateur))];
  const zones = [...new Set(donnees.rows.map((d) => d.zone))];
  const carte = new Map(donnees.rows.map((d) => [`${d.operateur}|${d.zone}`, d]));

  return (
    <div>
      <EnTetePage
        rf="RF-014"
        titre="Consultation de Couverture Réseau"
        sousTitre="Couverture par opérateur et zone géographique — République Démocratique du Congo (RF-014)"
        couleur="emerald"
      />

      <div className="overflow-x-auto carte p-4 mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left px-3 py-2 text-xs uppercase text-slate-400">Zone</th>
              {operateurs.map((o) => (
                <th key={o} className="px-3 py-2 text-xs uppercase text-slate-300 text-center">{o}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z} className="border-t border-[#131f3a]">
                <td className="px-3 py-2 text-slate-200 font-semibold whitespace-nowrap">{z}</td>
                {operateurs.map((o) => {
                  const d = carte.get(`${o}|${z}`);
                  if (!d) return <td key={o} className="px-3 py-2 text-center text-slate-600">—</td>;
                  return (
                    <td key={o} className="px-2 py-1.5 text-center">
                      <div className={`border rounded-md px-2 py-1.5 ${COULEUR_QUALITE[d.qualite]}`}>
                        <div className="font-bold text-xs">{d.technologie}</div>
                        <div className="text-[10px]">{d.qualite} · {d.population_couverte_pct}% pop.</div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Carte>
        <h2 className="font-bold text-white mb-2">Consultation via l&apos;API</h2>
        <pre className="text-xs font-mono text-sky-200 bg-[#0a1120] border border-[#1c2a4a] rounded-md p-3 overflow-x-auto">{`GET /api/v1/coverage?pays=RDC&zone=Goma
Authorization: Bearer omni_live_...

→ { "zone": "Goma", "resultats": [
    { "operateur": "Vodacom RDC", "technologie": "4G", "qualite": "bonne", "population_couverte_pct": 78 },
    ...
  ]}`}</pre>
      </Carte>
    </div>
  );
}
