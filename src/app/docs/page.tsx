import Link from "next/link";

export const metadata = { title: "Documentation API — OmniComm 360°" };

type Endpoint = {
  methode: "GET" | "POST" | "PATCH";
  chemin: string;
  rf: string;
  description: string;
  exemple: string;
};

const ENDPOINTS: Endpoint[] = [
  {
    methode: "POST",
    chemin: "/api/v1/messages",
    rf: "RF-001..006",
    description: "Envoie un message omnicanal (sms, whatsapp, rcs, email, push, fax). Routage Least-Cost automatique, conformité DND appliquée en temps réel, CDR généré.",
    exemple: `curl -X POST https://VOTRE-DOMAINE/api/v1/messages \\
  -H "Authorization: Bearer omni_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "canal": "sms",
    "de": "OmniComm",
    "vers": "+243811234567",
    "contenu": "Votre code est 493021",
    "categorie": "transactionnel"
  }'`,
  },
  {
    methode: "GET",
    chemin: "/api/v1/messages?canal=sms&limite=20",
    rf: "RF-001",
    description: "Liste les messages du tenant, filtrables par canal.",
    exemple: `curl https://VOTRE-DOMAINE/api/v1/messages?canal=sms \\
  -H "Authorization: Bearer omni_live_..."`,
  },
  {
    methode: "POST",
    chemin: "/api/v1/calls",
    rf: "RF-007, RF-011",
    description: "Lance un appel sortant (standard, ivr, conference, ia, webrtc). L'appel est signé STIR/SHAKEN (attestation A) et génère un CDR.",
    exemple: `curl -X POST https://VOTRE-DOMAINE/api/v1/calls \\
  -H "Authorization: Bearer omni_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "de": "+243815550000", "vers": "+243811234567", "type": "standard" }'`,
  },
  {
    methode: "GET",
    chemin: "/api/v1/sims?statut=active",
    rf: "RF-012",
    description: "Liste le parc SIM M2M/IoT du tenant.",
    exemple: `curl https://VOTRE-DOMAINE/api/v1/sims \\
  -H "Authorization: Bearer omni_live_..."`,
  },
  {
    methode: "PATCH",
    chemin: "/api/v1/sims",
    rf: "RF-012",
    description: "Cycle de vie SIM : activer, suspendre ou diagnostiquer (signal, latence).",
    exemple: `curl -X PATCH https://VOTRE-DOMAINE/api/v1/sims \\
  -H "Authorization: Bearer omni_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "id": 3, "action": "diagnostiquer" }'`,
  },
  {
    methode: "GET",
    chemin: "/api/v1/coverage?pays=RDC&zone=Goma",
    rf: "RF-014",
    description: "Couverture réseau par opérateur, zone géographique et technologie (2G/3G/4G/5G).",
    exemple: `curl "https://VOTRE-DOMAINE/api/v1/coverage?zone=Goma" \\
  -H "Authorization: Bearer omni_live_..."`,
  },
  {
    methode: "GET",
    chemin: "/api/v1/numbers?statut=disponible",
    rf: "RF-015",
    description: "Inventaire des numéros virtuels (locaux, mobiles, gratuits, surtaxés).",
    exemple: `curl "https://VOTRE-DOMAINE/api/v1/numbers?statut=disponible" \\
  -H "Authorization: Bearer omni_live_..."`,
  },
  {
    methode: "POST",
    chemin: "/api/v1/numbers",
    rf: "RF-015",
    description: "Réserve (attribue) un numéro disponible au tenant.",
    exemple: `curl -X POST https://VOTRE-DOMAINE/api/v1/numbers \\
  -H "Authorization: Bearer omni_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "id": 5 }'`,
  },
  {
    methode: "GET",
    chemin: "/api/v1/cdrs?type=voix",
    rf: "RF-023",
    description: "Call Detail Records du tenant (voix, sms, data, email, fax).",
    exemple: `curl https://VOTRE-DOMAINE/api/v1/cdrs \\
  -H "Authorization: Bearer omni_live_..."`,
  },
  {
    methode: "GET",
    chemin: "/api/v1/webhooks",
    rf: "RF-021",
    description: "Liste les webhooks configurés du tenant.",
    exemple: `curl https://VOTRE-DOMAINE/api/v1/webhooks \\
  -H "Authorization: Bearer omni_live_..."`,
  },
  {
    methode: "POST",
    chemin: "/api/v1/webhooks",
    rf: "RF-021",
    description: "Crée un webhook signé HMAC pour recevoir les événements en temps réel.",
    exemple: `curl -X POST https://VOTRE-DOMAINE/api/v1/webhooks \\
  -H "Authorization: Bearer omni_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "url": "https://votre-serveur.cd/hooks", "evenements": ["message.livre","appel.termine"] }'`,
  },
  {
    methode: "GET",
    chemin: "/api/v1/analytics/summary",
    rf: "RF-022",
    description: "Indicateurs clés : volumes, taux de livraison, MOS moyen, coût par destination.",
    exemple: `curl https://VOTRE-DOMAINE/api/v1/analytics/summary \\
  -H "Authorization: Bearer omni_live_..."`,
  },
];

const COULEUR_METHODE: Record<string, string> = {
  GET: "bg-sky-500/15 text-sky-300 border-sky-500/40",
  POST: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  PATCH: "bg-amber-500/15 text-amber-300 border-amber-500/40",
};

export default function PageDocs() {
  return (
    <main className="flex-1">
      <nav className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-white">
          OmniComm <span className="text-sky-400">360°</span>
        </Link>
        <Link href="/connexion" className="rounded-md bg-sky-600 hover:bg-sky-500 px-4 py-2 text-sm font-semibold text-white">
          Console
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 pb-12">
        <h1 className="text-3xl font-extrabold text-white mt-6">Documentation de l&apos;API v1</h1>
        <p className="text-slate-400 mt-2">
          API RESTful · réponses JSON · HTTPS/TLS obligatoire · authentification par clé Bearer.
          Testez chaque endpoint dans la <Link href="/console/developpeur" className="text-sky-400 hover:underline">sandbox du portail développeur</Link>.
        </p>

        <div className="carte p-4 mt-6">
          <h2 className="font-bold text-white mb-2">Authentification</h2>
          <p className="text-sm text-slate-400 mb-2">
            Créez vos clés dans la console (portail développeur). Préfixes : <code className="text-sky-300">omni_live_</code> (production)
            et <code className="text-sky-300">omni_test_</code> (sandbox — les envois restent au statut « envoyé », sans livraison).
          </p>
          <pre className="text-xs font-mono text-sky-200 bg-[#0a1120] border border-[#1c2a4a] rounded-md p-3 overflow-x-auto">{`Authorization: Bearer omni_live_xxxxxxxxxxxxxxxx`}</pre>
          <p className="text-xs text-slate-500 mt-2">
            Erreurs : <code>401 non_autorise</code> · <code>422 parametres_manquants</code> · <code>404 introuvable</code> · <code>409 indisponible</code> — format
            {" "}<code>{`{ "erreur": { "code", "message" } }`}</code>.
          </p>
        </div>

        <div className="space-y-4 mt-6">
          {ENDPOINTS.map((e) => (
            <div key={`${e.methode} ${e.chemin}`} className="carte p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${COULEUR_METHODE[e.methode]}`}>
                  {e.methode}
                </span>
                <code className="text-sm text-slate-100">{e.chemin}</code>
                <span className="ml-auto text-[11px] font-mono text-slate-500">{e.rf}</span>
              </div>
              <p className="text-sm text-slate-400 mt-2">{e.description}</p>
              <pre className="text-xs font-mono text-sky-200 bg-[#0a1120] border border-[#1c2a4a] rounded-md p-3 overflow-x-auto mt-2">
                {e.exemple}
              </pre>
            </div>
          ))}
        </div>

        <div className="carte p-4 mt-6 border-amber-500/40">
          <h2 className="font-bold text-white mb-2">SDKs officiels</h2>
          <p className="text-sm text-slate-400">
            JavaScript/TypeScript, PHP, Python et Java — <code className="text-sky-300">npm i @omnicomm360/sdk</code>,{" "}
            <code className="text-sky-300">composer require omnicomm360/sdk</code>,{" "}
            <code className="text-sky-300">pip install omnicomm360</code>. Chaque SDK encapsule l&apos;authentification,
            les retries et la vérification de signature des webhooks.
          </p>
        </div>
      </div>
    </main>
  );
}
