import { pool } from "@/lib/db";
import { creerWebhook, basculerWebhook } from "@/lib/actions";
import { Carte, CarteStat, EnTetePage, Tableau, CHAMP, BOUTON, BOUTON_DISCRET } from "@/components/ui";

export const dynamic = "force-dynamic";

const EVENEMENTS = [
  "message.livre", "message.echoue", "appel.termine", "appel.entrant",
  "sim.alerte", "geoloc.mise_a_jour", "facture.emise", "fraude.detectee",
];

export default async function PageWebhooks() {
  const [hooks, livraisons] = await Promise.all([
    pool.query(`SELECT w.*, t.nom AS tenant,
      (SELECT COUNT(*) FROM webhook_livraisons l WHERE l.webhook_id = w.id) AS envois
      FROM webhooks w JOIN tenants t ON t.id = w.tenant_id ORDER BY w.id`),
    pool.query(`SELECT l.*, w.url FROM webhook_livraisons l JOIN webhooks w ON w.id = l.webhook_id
      ORDER BY l.created_at DESC LIMIT 15`),
  ]);
  const ok = livraisons.rows.filter((l) => l.statut_http && l.statut_http < 400).length;

  return (
    <div>
      <EnTetePage
        rf="RF-021"
        titre="Webhooks Configurables"
        sousTitre="Notifications d'événements en temps réel vers vos serveurs, signées HMAC (RF-021)"
        couleur="cyan"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CarteStat libelle="Webhooks configurés" valeur={hooks.rows.length} couleur="cyan" />
        <CarteStat libelle="Actifs" valeur={hooks.rows.filter((h) => h.actif).length} couleur="emerald" />
        <CarteStat libelle="Livraisons récentes" valeur={livraisons.rows.length} couleur="sky" />
        <CarteStat libelle="Taux de succès" valeur={`${livraisons.rows.length ? Math.round((ok / livraisons.rows.length) * 100) : 0}%`} couleur="amber" />
      </div>

      <Carte className="mb-6">
        <h2 className="font-bold text-white mb-3">Créer un webhook</h2>
        <form action={creerWebhook} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-xs text-slate-400 mb-1">URL de destination (HTTPS obligatoire)</label>
            <input name="url" required placeholder="https://votre-serveur.cd/webhooks" className={CHAMP} />
          </div>
          <div className="flex-1 min-w-64">
            <label className="block text-xs text-slate-400 mb-1">Événements (séparés par des virgules)</label>
            <input name="evenements" defaultValue="message.livre,appel.termine" className={CHAMP} />
          </div>
          <button className={BOUTON}>Créer</button>
        </form>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {EVENEMENTS.map((e) => (
            <span key={e} className="text-[10px] font-mono border border-[#1c2a4a] rounded-full px-2 py-0.5 text-slate-400">{e}</span>
          ))}
        </div>
      </Carte>

      <h2 className="font-bold text-white mb-3">Webhooks configurés</h2>
      <div className="space-y-2 mb-6">
        {hooks.rows.map((h) => (
          <Carte key={h.id}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm text-cyan-300 truncate">{h.url}</span>
              <span className={`text-xs ${h.actif ? "text-emerald-300" : "text-slate-500"}`}>
                {h.actif ? "● actif" : "○ désactivé"}
              </span>
              <form action={basculerWebhook} className="ml-auto">
                <input type="hidden" name="id" value={h.id} />
                <button className={BOUTON_DISCRET}>{h.actif ? "Désactiver" : "Activer"}</button>
              </form>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {h.evenements.map((e: string) => (
                <span key={e} className="text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/30 rounded-full px-2 py-0.5 text-cyan-300">{e}</span>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              {h.tenant} · {h.envois} livraisons · secret <span className="font-mono">{h.secret.slice(0, 12)}…</span>
            </div>
          </Carte>
        ))}
      </div>

      <h2 className="font-bold text-white mb-3">Journal des livraisons</h2>
      <Tableau
        entetes={["Événement", "URL", "HTTP", "Tentatives", "Horodatage"]}
        lignes={livraisons.rows.map((l) => [
          <span key="e" className="font-mono text-xs text-cyan-300">{l.evenement}</span>,
          <span key="u" className="font-mono text-xs text-slate-400 max-w-56 truncate inline-block">{l.url}</span>,
          <span key="s" className={`font-mono text-xs font-bold ${l.statut_http && l.statut_http < 400 ? "text-emerald-300" : "text-rose-300"}`}>
            {l.statut_http ?? "—"}
          </span>,
          <span key="t" className="text-xs text-slate-400">{l.tentatives}</span>,
          <span key="d" className="text-xs text-slate-500">{new Date(l.created_at).toLocaleString("fr-FR")}</span>,
        ])}
      />
    </div>
  );
}
