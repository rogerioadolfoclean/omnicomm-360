"use client";

import { useState } from "react";
import { CHAMP, BOUTON } from "@/components/ui";

const EXEMPLES: Record<string, { methode: string; chemin: string; corps?: string }> = {
  "Lister les messages": { methode: "GET", chemin: "/api/v1/messages" },
  "Envoyer un SMS": {
    methode: "POST",
    chemin: "/api/v1/messages",
    corps: JSON.stringify({ canal: "sms", de: "OmniComm", vers: "+243811234567", contenu: "Test depuis la sandbox" }, null, 2),
  },
  "Lancer un appel": {
    methode: "POST",
    chemin: "/api/v1/calls",
    corps: JSON.stringify({ de: "+243815550000", vers: "+243811234567" }, null, 2),
  },
  "Lister les SIM IoT": { methode: "GET", chemin: "/api/v1/sims" },
  "Couverture réseau Goma": { methode: "GET", chemin: "/api/v1/coverage?zone=Goma" },
  "Numéros disponibles": { methode: "GET", chemin: "/api/v1/numbers?statut=disponible" },
  "CDRs récents": { methode: "GET", chemin: "/api/v1/cdrs" },
  "Résumé analytics": { methode: "GET", chemin: "/api/v1/analytics/summary" },
};

export function SandboxApi() {
  const [cle, setCle] = useState("");
  const [methode, setMethode] = useState("GET");
  const [chemin, setChemin] = useState("/api/v1/messages");
  const [corps, setCorps] = useState("");
  const [reponse, setReponse] = useState<string>("");
  const [statut, setStatut] = useState<number | null>(null);
  const [enCours, setEnCours] = useState(false);

  async function executer() {
    setEnCours(true);
    setReponse("");
    setStatut(null);
    try {
      const res = await fetch(chemin, {
        method: methode,
        headers: {
          Authorization: `Bearer ${cle}`,
          ...(methode !== "GET" ? { "Content-Type": "application/json" } : {}),
        },
        body: methode !== "GET" && corps ? corps : undefined,
      });
      setStatut(res.status);
      const texte = await res.text();
      try {
        setReponse(JSON.stringify(JSON.parse(texte), null, 2));
      } catch {
        setReponse(texte);
      }
    } catch (e) {
      setReponse(String(e));
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {Object.entries(EXEMPLES).map(([nom, ex]) => (
          <button
            key={nom}
            type="button"
            onClick={() => {
              setMethode(ex.methode);
              setChemin(ex.chemin);
              setCorps(ex.corps ?? "");
            }}
            className="text-[11px] border border-[#1c2a4a] hover:border-sky-500/60 rounded-full px-2.5 py-1 text-slate-300 cursor-pointer"
          >
            {nom}
          </button>
        ))}
      </div>
      <div>
        <label className="block text-xs text-slate-400 mb-1">Clé API (Bearer)</label>
        <input value={cle} onChange={(e) => setCle(e.target.value)} placeholder="omni_test_… ou omni_live_…" className={CHAMP} />
      </div>
      <div className="flex gap-2">
        <select value={methode} onChange={(e) => setMethode(e.target.value)} className={`${CHAMP} w-28`}>
          <option>GET</option>
          <option>POST</option>
        </select>
        <input value={chemin} onChange={(e) => setChemin(e.target.value)} className={`${CHAMP} font-mono`} />
      </div>
      {methode !== "GET" && (
        <textarea
          value={corps}
          onChange={(e) => setCorps(e.target.value)}
          rows={6}
          placeholder='{ "canal": "sms", ... }'
          className={`${CHAMP} font-mono text-xs`}
        />
      )}
      <button onClick={executer} disabled={enCours || !cle} className={BOUTON}>
        {enCours ? "Exécution…" : "Exécuter la requête →"}
      </button>
      {statut !== null && (
        <div>
          <div className={`text-xs font-mono mb-1 ${statut < 300 ? "text-emerald-300" : "text-rose-300"}`}>
            HTTP {statut}
          </div>
          <pre className="text-xs font-mono text-sky-100 bg-[#0a1120] border border-[#1c2a4a] rounded-md p-3 overflow-x-auto max-h-96 overflow-y-auto">
            {reponse}
          </pre>
        </div>
      )}
    </div>
  );
}
