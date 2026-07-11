import { pool } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { basculerTenant } from "@/lib/actions";
import { Carte, CarteStat, EnTetePage, Tableau, BOUTON_DISCRET } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PageTenants() {
  const session = await getSession();
  const [tenants, comptes] = await Promise.all([
    pool.query(`SELECT t.*,
      (SELECT COUNT(*) FROM utilisateurs u WHERE u.tenant_id = t.id) AS utilisateurs,
      (SELECT COUNT(*) FROM api_keys k WHERE k.tenant_id = t.id AND k.actif) AS cles,
      (SELECT COUNT(*) FROM sims s WHERE s.tenant_id = t.id) AS sims
      FROM tenants t ORDER BY t.id`),
    pool.query(`SELECT u.nom, u.email, u.role, u.actif, t.nom AS tenant FROM utilisateurs u
      JOIN tenants t ON t.id = u.tenant_id ORDER BY u.id`),
  ]);

  return (
    <div>
      <EnTetePage
        rf="RF-017"
        titre="Architecture Multi-Tenant"
        sousTitre="Isolation par tenant et marque blanche (White Label) pour les revendeurs (RF-017)"
        couleur="amber"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CarteStat libelle="Tenants" valeur={tenants.rows.length} couleur="amber" />
        <CarteStat libelle="Revendeurs white-label" valeur={tenants.rows.filter((t) => t.white_label).length} couleur="violet" />
        <CarteStat libelle="Utilisateurs" valeur={comptes.rows.length} couleur="sky" />
        <CarteStat libelle="Actifs" valeur={tenants.rows.filter((t) => t.actif).length} couleur="emerald" />
      </div>

      <h2 className="font-bold text-white mb-3">Tenants de la plateforme</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {tenants.rows.map((t) => (
          <Carte key={t.id} className={t.white_label ? "border-violet-500/40" : ""}>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">{t.nom}</h3>
              <span className={`ml-auto text-xs ${t.actif ? "text-emerald-300" : "text-rose-300"}`}>
                {t.actif ? "● actif" : "○ suspendu"}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">/{t.slug} · {t.pays} · {t.secteur}</div>
            <div className="flex gap-2 mt-2">
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${t.type === "revendeur" ? "bg-violet-500/15 text-violet-300" : "bg-sky-500/15 text-sky-300"}`}>
                {t.type}
              </span>
              {t.white_label && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">
                  white label
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              {[["Utilisateurs", t.utilisateurs], ["Clés API", t.cles], ["SIMs", t.sims]].map(([l, v]) => (
                <div key={l} className="border border-[#1c2a4a] rounded-md py-1.5 bg-[#0a1120]">
                  <div className="text-sm font-bold text-slate-100">{v}</div>
                  <div className="text-[10px] text-slate-500">{l}</div>
                </div>
              ))}
            </div>
            {session?.role === "admin" && (
              <form action={basculerTenant} className="mt-3">
                <input type="hidden" name="id" value={t.id} />
                <button className={BOUTON_DISCRET}>{t.actif ? "Suspendre le tenant" : "Réactiver le tenant"}</button>
              </form>
            )}
          </Carte>
        ))}
      </div>

      <h2 className="font-bold text-white mb-3">Comptes utilisateurs</h2>
      <Tableau
        entetes={["Nom", "E-mail", "Rôle", "Tenant", "État"]}
        lignes={comptes.rows.map((u) => [
          <span key="n" className="text-slate-100">{u.nom}</span>,
          <span key="e" className="font-mono text-xs text-slate-300">{u.email}</span>,
          <span key="r" className="text-xs uppercase font-bold text-amber-300">{u.role}</span>,
          <span key="t" className="text-xs text-slate-400">{u.tenant}</span>,
          <span key="a" className={`text-xs ${u.actif ? "text-emerald-300" : "text-rose-300"}`}>{u.actif ? "actif" : "désactivé"}</span>,
        ])}
      />
    </div>
  );
}
