import { pool } from "@/lib/db";
import { Carte, CarteStat, EnTetePage, BadgeStatut, Tableau } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PageSip() {
  const [trunks, webrtc] = await Promise.all([
    pool.query(`SELECT s.*, t.nom AS tenant FROM sip_trunks s JOIN tenants t ON t.id = s.tenant_id ORDER BY s.id`),
    pool.query(`SELECT COUNT(*) AS n, COALESCE(SUM(duree_secondes),0) AS duree FROM appels WHERE type = 'webrtc'`),
  ]);
  const w = webrtc.rows[0];
  const totalCanaux = trunks.rows.reduce((acc, t) => acc + t.canaux_max, 0);

  return (
    <div>
      <EnTetePage
        rf="RF-009"
        titre="SIP Trunking & WebRTC"
        sousTitre="Interconnexion SIP pour PBX/centres d'appels et SDK WebRTC pour la communication dans le navigateur (RF-009)"
        couleur="violet"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CarteStat libelle="Trunks SIP" valeur={trunks.rows.length} couleur="violet" />
        <CarteStat libelle="Canaux simultanés" valeur={totalCanaux} couleur="sky" />
        <CarteStat libelle="Appels WebRTC" valeur={w.n} couleur="emerald" />
        <CarteStat libelle="Minutes WebRTC" valeur={Math.round(Number(w.duree) / 60)} couleur="amber" />
      </div>

      <h2 className="font-bold text-white mb-3">Trunks SIP configurés</h2>
      <Tableau
        entetes={["Nom", "Domaine SIP", "Tenant", "IPs autorisées", "Codecs", "Canaux max", "Statut"]}
        lignes={trunks.rows.map((t) => [
          <span key="n" className="text-slate-100 font-semibold">{t.nom}</span>,
          <span key="d" className="font-mono text-xs text-violet-300">{t.domaine}</span>,
          <span key="t" className="text-xs text-slate-400">{t.tenant}</span>,
          <span key="i" className="font-mono text-xs text-slate-400">{t.ips_autorisees.join(", ")}</span>,
          <span key="c" className="text-xs text-slate-400">{t.codecs.join(", ")}</span>,
          <span key="m" className="text-slate-200">{t.canaux_max}</span>,
          <BadgeStatut key="s" statut={t.statut} />,
        ])}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Carte>
          <h2 className="font-bold text-white mb-2">SDK WebRTC — communication in-browser</h2>
          <p className="text-sm text-slate-400 mb-3">
            Intégrez la voix directement dans votre application web, sans installation :
          </p>
          <pre className="text-xs font-mono text-sky-200 bg-[#0a1120] border border-[#1c2a4a] rounded-md p-3 overflow-x-auto">{`import { OmniRTC } from "@omnicomm360/webrtc";

const client = new OmniRTC({ cleApi: "omni_live_..." });
await client.connecter();
const appel = await client.appeler("+243811234567");
appel.on("termine", (cdr) => console.log(cdr));`}</pre>
        </Carte>
        <Carte>
          <h2 className="font-bold text-white mb-2">Configuration SIP</h2>
          <ul className="text-sm text-slate-300 space-y-2">
            <li className="flex justify-between border-b border-[#131f3a] pb-1.5">
              <span className="text-slate-500">Serveur d&apos;enregistrement</span>
              <span className="font-mono text-xs">sip.omnicomm360.cd:5061 (TLS)</span>
            </li>
            <li className="flex justify-between border-b border-[#131f3a] pb-1.5">
              <span className="text-slate-500">Transport</span>
              <span className="font-mono text-xs">TLS 1.3 / SRTP</span>
            </li>
            <li className="flex justify-between border-b border-[#131f3a] pb-1.5">
              <span className="text-slate-500">Codecs supportés</span>
              <span className="font-mono text-xs">G.711, G.729, Opus</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Authentification</span>
              <span className="font-mono text-xs">Digest + filtrage IP</span>
            </li>
          </ul>
        </Carte>
      </div>
    </div>
  );
}
