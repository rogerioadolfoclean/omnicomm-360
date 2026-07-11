import Link from "next/link";
import { pool } from "@/lib/db";
import { exigerSession } from "@/lib/auth";
import { DOMAINES, MOTEURS } from "@/lib/constants";
import { Carte, CarteStat, EnTetePage, ACCENTS, BadgeStatut } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function VueEnsemble({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const { erreur } = await searchParams;
  await exigerSession();

  const [stats, alertes, derniersMsg] = await Promise.all([
    pool.query(`SELECT
      (SELECT COUNT(*) FROM messages) AS messages,
      (SELECT COUNT(*) FROM messages WHERE statut = 'livre') AS messages_livres,
      (SELECT COUNT(*) FROM appels) AS appels,
      (SELECT COALESCE(ROUND(AVG(mos_score),2),0) FROM appels WHERE mos_score IS NOT NULL) AS mos_moyen,
      (SELECT COUNT(*) FROM sims WHERE statut = 'active') AS sims_actives,
      (SELECT COUNT(*) FROM sims) AS sims_total,
      (SELECT COUNT(*) FROM numeros_virtuels WHERE statut = 'attribue') AS numeros,
      (SELECT COUNT(*) FROM tenants WHERE actif) AS tenants,
      (SELECT COUNT(*) FROM alertes_fraude WHERE statut IN ('nouvelle','en_cours')) AS fraudes_ouvertes,
      (SELECT COALESCE(SUM(cout),0)::numeric(12,2) FROM compteurs_usage WHERE periode = '2026-07') AS usage_mois,
      (SELECT COUNT(*) FROM flux_streaming WHERE statut = 'en_ligne') AS flux_en_ligne,
      (SELECT COUNT(*) FROM webhooks WHERE actif) AS webhooks_actifs`),
    pool.query(`SELECT id, type, gravite, description, statut, created_at
      FROM alertes_fraude WHERE statut IN ('nouvelle','en_cours') ORDER BY score DESC LIMIT 3`),
    pool.query(`SELECT canal, vers, statut, created_at FROM messages ORDER BY created_at DESC LIMIT 5`),
  ]);
  const s = stats.rows[0];

  return (
    <div>
      <EnTetePage
        titre="Vue d'ensemble de la plateforme"
        sousTitre="API complète de communications — Voix • Messages • IoT • Radio Web • MVNO"
      />
      {erreur && (
        <p className="mb-4 text-sm text-amber-300 border border-amber-500/30 bg-amber-500/10 rounded-md px-3 py-2">
          {erreur === "lecture-seule"
            ? "Votre rôle est en lecture seule : action non autorisée."
            : "Accès réservé à l'administrateur de la plateforme."}
        </p>
      )}

      {/* Statistiques clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <CarteStat libelle="Messages envoyés" valeur={s.messages} detail={`${s.messages_livres} livrés`} couleur="sky" />
        <CarteStat libelle="Appels" valeur={s.appels} detail={`MOS moyen ${s.mos_moyen}`} couleur="violet" />
        <CarteStat libelle="SIM IoT actives" valeur={`${s.sims_actives}/${s.sims_total}`} detail="AgriTech / Minier / Logistique" couleur="emerald" />
        <CarteStat libelle="Numéros attribués" valeur={s.numeros} detail="locaux, mobiles, gratuits, payants" couleur="emerald" />
        <CarteStat libelle="Tenants actifs" valeur={s.tenants} detail="multi-tenant / white label" couleur="amber" />
        <CarteStat libelle="Consommation 2026-07" valeur={`${s.usage_mois} $`} detail="facturation à l'usage" couleur="amber" />
        <CarteStat libelle="Flux streaming en ligne" valeur={s.flux_en_ligne} detail="radio web, podcast, vidéo" couleur="violet" />
        <CarteStat libelle="Alertes fraude ouvertes" valeur={s.fraudes_ouvertes} detail="SIM Box, spoofing, fuites" couleur="cyan" />
      </div>

      {/* Moteurs du cœur de plateforme */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        {MOTEURS.map((m) => (
          <Carte key={m.nom} className="text-center">
            <div className={`text-xs font-bold uppercase ${m.couleur}`}>{m.nom}</div>
            <div className="text-emerald-400 text-xs mt-1.5">● opérationnel</div>
          </Carte>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alertes prioritaires */}
        <Carte>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">Alertes fraude prioritaires</h2>
            <Link href="/console/anti-fraude" className="text-xs text-sky-400 hover:underline">Tout voir →</Link>
          </div>
          <ul className="space-y-2">
            {alertes.rows.map((a) => (
              <li key={a.id} className="border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">
                <div className="flex items-center gap-2">
                  <BadgeStatut statut={a.gravite} />
                  <span className="text-xs font-mono text-slate-400">{a.type}</span>
                  <span className="ml-auto"><BadgeStatut statut={a.statut} /></span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 line-clamp-2">{a.description}</p>
              </li>
            ))}
            {alertes.rows.length === 0 && <li className="text-sm text-slate-500">Aucune alerte ouverte.</li>}
          </ul>
        </Carte>

        {/* Derniers messages */}
        <Carte>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-white">Derniers messages</h2>
            <Link href="/console/sms" className="text-xs text-sky-400 hover:underline">Module SMS →</Link>
          </div>
          <ul className="space-y-2">
            {derniersMsg.rows.map((m, i) => (
              <li key={i} className="flex items-center gap-2 border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120] text-sm">
                <span className="text-xs font-mono uppercase text-sky-300">{m.canal}</span>
                <span className="text-slate-300 truncate">{m.vers}</span>
                <span className="ml-auto"><BadgeStatut statut={m.statut} /></span>
              </li>
            ))}
          </ul>
        </Carte>
      </div>

      {/* Accès aux 24 modules */}
      <h2 className="font-bold text-white mt-8 mb-3">Les 24 modules de la plateforme</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {DOMAINES.map((d) => {
          const a = ACCENTS[d.couleur];
          return (
            <Carte key={d.numero} className={a.bord}>
              <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${a.texte}`}>
                {d.numero} — {d.nom}
              </div>
              <ul className="space-y-1">
                {d.modules.map((m) => (
                  <li key={m.rf}>
                    <Link href={m.href} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white py-0.5">
                      <span className="text-[10px] font-mono text-slate-500">{m.rf}</span>
                      <span className="truncate">{m.titre}</span>
                      <span className="ml-auto text-sky-500">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Carte>
          );
        })}
      </div>
    </div>
  );
}
