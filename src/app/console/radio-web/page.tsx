import { pool } from "@/lib/db";
import { Carte, CarteStat, EnTetePage, BadgeStatut } from "@/components/ui";

export const dynamic = "force-dynamic";

const ICONES: Record<string, string> = { radio: "📻", podcast: "🎙", video: "🎬" };

export default async function PageRadio() {
  const flux = await pool.query(
    `SELECT f.*, t.nom AS tenant FROM flux_streaming f JOIN tenants t ON t.id = f.tenant_id ORDER BY f.auditeurs_actuels DESC`
  );
  const enLigne = flux.rows.filter((f) => f.statut === "en_ligne");
  const auditeurs = enLigne.reduce((a, f) => a + f.auditeurs_actuels, 0);

  return (
    <div>
      <EnTetePage
        rf="RF-010"
        titre="Radio Web & Podcast"
        sousTitre="Infrastructure de streaming audio HLS / Icecast pour radio web, podcast et vidéo professionnelle (RF-010)"
        couleur="violet"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CarteStat libelle="Flux configurés" valeur={flux.rows.length} couleur="violet" />
        <CarteStat libelle="En ligne" valeur={enLigne.length} couleur="emerald" />
        <CarteStat libelle="Auditeurs en direct" valeur={auditeurs} couleur="sky" />
        <CarteStat libelle="Pic d'audience" valeur={Math.max(0, ...flux.rows.map((f) => f.auditeurs_pic))} couleur="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flux.rows.map((f) => (
          <Carte key={f.id}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{ICONES[f.type]}</span>
              <div>
                <h2 className="font-bold text-white">{f.nom}</h2>
                <div className="text-xs text-slate-500">{f.tenant}</div>
              </div>
              <span className="ml-auto"><BadgeStatut statut={f.statut} /></span>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="border border-[#1c2a4a] rounded-md py-1.5 bg-[#0a1120]">
                <div className="text-[10px] uppercase text-slate-500">Protocole</div>
                <div className="text-xs font-mono text-violet-300">{f.protocole}</div>
              </div>
              <div className="border border-[#1c2a4a] rounded-md py-1.5 bg-[#0a1120]">
                <div className="text-[10px] uppercase text-slate-500">Bitrate</div>
                <div className="text-xs text-slate-200">{f.bitrate_kbps} kbps</div>
              </div>
              <div className="border border-[#1c2a4a] rounded-md py-1.5 bg-[#0a1120]">
                <div className="text-[10px] uppercase text-slate-500">Auditeurs</div>
                <div className="text-xs text-emerald-300">{f.auditeurs_actuels} (pic {f.auditeurs_pic})</div>
              </div>
            </div>
            <div className="mt-3 text-xs font-mono text-sky-300 bg-[#0a1120] border border-[#1c2a4a] rounded-md px-3 py-2 truncate">
              {f.url_flux}
            </div>
          </Carte>
        ))}
      </div>
    </div>
  );
}
