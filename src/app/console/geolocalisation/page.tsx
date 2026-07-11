import { pool } from "@/lib/db";
import { Carte, CarteStat, EnTetePage, Tableau } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PageGeoloc() {
  const [points, stats] = await Promise.all([
    pool.query(`SELECT g.*, s.etiquette, s.msisdn, s.secteur FROM geolocalisations g
      JOIN sims s ON s.id = g.sim_id ORDER BY g.created_at DESC LIMIT 25`),
    pool.query(`SELECT COUNT(*) AS n, COUNT(DISTINCT sim_id) AS sims,
      COALESCE(ROUND(AVG(precision_m)),0) AS prec FROM geolocalisations`),
  ]);
  const s = stats.rows[0];

  return (
    <div>
      <EnTetePage
        rf="RF-013"
        titre="Géolocalisation (Triangulation)"
        sousTitre="Localisation des équipements via triangulation des antennes GSM — sans GPS (RF-013)"
        couleur="emerald"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <CarteStat libelle="Positions relevées" valeur={s.n} couleur="emerald" />
        <CarteStat libelle="Équipements localisés" valeur={s.sims} couleur="sky" />
        <CarteStat libelle="Précision moyenne" valeur={`${s.prec} m`} detail="triangulation multi-cellules" couleur="amber" />
      </div>

      <Carte className="mb-6">
        <h2 className="font-bold text-white mb-2">Principe de la triangulation GSM</h2>
        <p className="text-sm text-slate-400">
          Chaque équipement IoT est vu par plusieurs antennes (cellules). La plateforme mesure la puissance du signal
          (RSSI) et le temps d&apos;avance (Timing Advance) de chaque cellule, puis calcule la position par intersection —
          idéal pour les capteurs AgriTech et les engins miniers sans module GPS.
        </p>
      </Carte>

      <h2 className="font-bold text-white mb-3">Dernières positions</h2>
      <Tableau
        entetes={["Équipement", "MSISDN", "Secteur", "Latitude", "Longitude", "Précision", "Cellules", "Horodatage"]}
        lignes={points.rows.map((p) => [
          <span key="e" className="text-xs text-slate-200">{p.etiquette}</span>,
          <span key="m" className="font-mono text-xs text-slate-400">{p.msisdn}</span>,
          <span key="s" className="text-xs uppercase text-emerald-300">{p.secteur}</span>,
          <span key="la" className="font-mono text-xs text-sky-300">{Number(p.latitude).toFixed(5)}</span>,
          <span key="lo" className="font-mono text-xs text-sky-300">{Number(p.longitude).toFixed(5)}</span>,
          <span key="pr" className="text-xs text-slate-300">±{p.precision_m} m</span>,
          <span key="c" className="font-mono text-[11px] text-slate-500">
            {(p.cellules as { cellId: number; rssi: number }[]).map((c) => `#${c.cellId} (${c.rssi} dBm)`).join(" · ")}
          </span>,
          <span key="d" className="text-xs text-slate-500">{new Date(p.created_at).toLocaleString("fr-FR")}</span>,
        ])}
      />
    </div>
  );
}
