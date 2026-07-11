import { pool } from "@/lib/db";
import { Carte, CarteStat, EnTetePage, Tableau } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PageCdrs() {
  const [cdrs, stats] = await Promise.all([
    pool.query(`SELECT c.*, t.nom AS tenant FROM cdrs c JOIN tenants t ON t.id = c.tenant_id
      ORDER BY c.debut DESC LIMIT 30`),
    pool.query(`SELECT COUNT(*) AS n, COUNT(DISTINCT type) AS types,
      COALESCE(SUM(cout),0)::numeric(12,4) AS cout,
      MIN(debut) AS plus_ancien FROM cdrs`),
  ]);
  const s = stats.rows[0];

  return (
    <div>
      <EnTetePage
        rf="RF-023"
        titre="Rétention des CDR et Journaux"
        sousTitre="Conservation réglementaire des Call Detail Records — ARCEP / ANRT / RGPD (RF-023)"
        couleur="cyan"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CarteStat libelle="CDR conservés" valeur={s.n} couleur="cyan" />
        <CarteStat libelle="Types de trafic" valeur={s.types} detail="voix, SMS, data, e-mail, fax" couleur="sky" />
        <CarteStat libelle="Valeur mesurée" valeur={`${s.cout} $`} couleur="amber" />
        <CarteStat
          libelle="Plus ancien enregistrement"
          valeur={s.plus_ancien ? new Date(s.plus_ancien).toLocaleDateString("fr-FR") : "—"}
          couleur="emerald"
        />
      </div>

      <Carte className="mb-6">
        <h2 className="font-bold text-white mb-2">Politique de rétention réglementaire</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          {[
            ["CDR voix & SMS", "12 mois en ligne + 5 ans archivés (exigences ARCEP/ANRT) — horodatage, source, destination, durée, coût."],
            ["Journaux de connexion", "12 mois (obligations légales locales) — IP, identifiants techniques, événements d'authentification."],
            ["Données personnelles", "Minimisation RGPD/LGPD : anonymisation après la période légale, registre des traitements tenu à jour."],
          ].map(([t, d]) => (
            <div key={t} className="border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">
              <div className="text-cyan-300 font-semibold text-xs">{t}</div>
              <div className="text-xs text-slate-400 mt-1">{d}</div>
            </div>
          ))}
        </div>
      </Carte>

      <h2 className="font-bold text-white mb-3">Call Detail Records</h2>
      <Tableau
        entetes={["Type", "Source", "Destination", "Début", "Durée", "Coût", "Opérateur", "Tenant"]}
        lignes={cdrs.rows.map((c) => [
          <span key="t" className="font-mono text-xs uppercase text-cyan-300">{c.type}</span>,
          <span key="s" className="font-mono text-xs text-slate-300">{c.source}</span>,
          <span key="d" className="font-mono text-xs text-slate-300">{c.destination}</span>,
          <span key="db" className="text-xs text-slate-400">{new Date(c.debut).toLocaleString("fr-FR")}</span>,
          <span key="du" className="text-xs text-slate-400">{c.duree_secondes}s</span>,
          <span key="c" className="text-xs text-amber-200">{Number(c.cout).toFixed(5)} $</span>,
          <span key="o" className="text-xs text-slate-400">{c.operateur ?? "—"}</span>,
          <span key="te" className="text-xs text-slate-500">{c.tenant}</span>,
        ])}
      />
    </div>
  );
}
