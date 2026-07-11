import Link from "next/link";
import { cookies } from "next/headers";
import { pool } from "@/lib/db";
import { creerCleApi, revoquerCleApi } from "@/lib/actions";
import { Carte, CarteStat, EnTetePage, Tableau, CHAMP, BOUTON, BOUTON_DISCRET } from "@/components/ui";
import { SandboxApi } from "@/components/sandbox-api";

export const dynamic = "force-dynamic";

export default async function PageDeveloppeur() {
  const jar = await cookies();
  const nouvelleCle = jar.get("omni_nouvelle_cle")?.value;

  const [cles, logs, stats] = await Promise.all([
    pool.query(`SELECT k.*, t.nom AS tenant FROM api_keys k JOIN tenants t ON t.id = k.tenant_id ORDER BY k.created_at DESC`),
    pool.query(`SELECT * FROM logs_api ORDER BY created_at DESC LIMIT 20`),
    pool.query(`SELECT COUNT(*) AS n,
      COUNT(*) FILTER (WHERE statut_http < 400) AS ok,
      COALESCE(ROUND(AVG(duree_ms)),0) AS latence FROM logs_api`),
  ]);
  const s = stats.rows[0];

  return (
    <div>
      <EnTetePage
        rf="RF-016"
        titre="Portail du Développeur"
        sousTitre="Sandbox, documentation interactive, clés API et logs en temps réel (RF-016)"
        couleur="amber"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CarteStat libelle="Clés API actives" valeur={cles.rows.filter((k) => k.actif).length} couleur="amber" />
        <CarteStat libelle="Appels API" valeur={s.n} couleur="sky" />
        <CarteStat libelle="Taux de succès" valeur={`${s.n > 0 ? Math.round((s.ok / s.n) * 100) : 0}%`} couleur="emerald" />
        <CarteStat libelle="Latence moyenne" valeur={`${s.latence} ms`} couleur="violet" />
      </div>

      {nouvelleCle && (
        <div className="mb-6 border border-emerald-500/40 bg-emerald-500/10 rounded-md p-4">
          <div className="font-bold text-emerald-300 text-sm">🔑 Nouvelle clé créée — copiez-la maintenant, elle ne sera plus jamais affichée :</div>
          <code className="block mt-2 font-mono text-sm text-white bg-[#0a1120] border border-[#1c2a4a] rounded-md px-3 py-2 select-all">
            {nouvelleCle}
          </code>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Carte>
          <h2 className="font-bold text-white mb-3">Clés API</h2>
          <form action={creerCleApi} className="flex flex-wrap gap-2 items-end mb-4">
            <div className="flex-1 min-w-40">
              <label className="block text-xs text-slate-400 mb-1">Nom de la clé</label>
              <input name="nom" required placeholder="Backend production" className={CHAMP} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Environnement</label>
              <select name="environnement" className={CHAMP}>
                <option value="sandbox">Sandbox</option>
                <option value="production">Production</option>
              </select>
            </div>
            <button className={BOUTON}>Créer</button>
          </form>
          <ul className="space-y-2">
            {cles.rows.map((k) => (
              <li key={k.id} className="border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-100">{k.nom}</span>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${k.environnement === "production" ? "bg-emerald-500/15 text-emerald-300" : "bg-sky-500/15 text-sky-300"}`}>
                    {k.environnement}
                  </span>
                  {!k.actif && <span className="text-[10px] text-rose-300">révoquée</span>}
                  {k.actif && (
                    <form action={revoquerCleApi} className="ml-auto">
                      <input type="hidden" name="id" value={k.id} />
                      <button className={BOUTON_DISCRET}>Révoquer</button>
                    </form>
                  )}
                </div>
                <div className="text-xs font-mono text-slate-500 mt-1">
                  {k.prefixe}… · {k.tenant} · dernière utilisation :{" "}
                  {k.derniere_utilisation ? new Date(k.derniere_utilisation).toLocaleString("fr-FR") : "jamais"}
                </div>
              </li>
            ))}
          </ul>
        </Carte>

        <Carte>
          <h2 className="font-bold text-white mb-1">Sandbox de test</h2>
          <p className="text-xs text-slate-500 mb-3">
            Testez l&apos;API en direct — consultez la <Link href="/docs" className="text-sky-400 hover:underline">documentation interactive</Link> pour tous les endpoints.
          </p>
          <SandboxApi />
        </Carte>
      </div>

      <h2 className="font-bold text-white mb-3">Logs API en temps réel</h2>
      <Tableau
        entetes={["Méthode", "Endpoint", "Statut", "Durée", "IP", "Horodatage"]}
        lignes={logs.rows.map((l) => [
          <span key="m" className="font-mono text-xs font-bold text-sky-300">{l.methode}</span>,
          <span key="e" className="font-mono text-xs text-slate-200">{l.endpoint}</span>,
          <span key="s" className={`font-mono text-xs font-bold ${l.statut_http < 400 ? "text-emerald-300" : "text-rose-300"}`}>
            {l.statut_http}
          </span>,
          <span key="d" className="text-xs text-slate-400">{l.duree_ms} ms</span>,
          <span key="i" className="font-mono text-xs text-slate-500">{l.ip}</span>,
          <span key="t" className="text-xs text-slate-500">{new Date(l.created_at).toLocaleString("fr-FR")}</span>,
        ])}
      />
    </div>
  );
}
