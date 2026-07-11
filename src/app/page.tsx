import Link from "next/link";
import {
  DOMAINES,
  BADGES_PLATEFORME,
  CANAUX_ENTRANTS,
  SORTIES,
  MOTEURS,
  COUCHE_DONNEES,
  SECURITE_CONFORMITE,
  EXPERIENCE_DEV,
  CAS_UTILISATION,
  GARANTIES,
  SLOGAN,
} from "@/lib/constants";
import { ACCENTS } from "@/components/ui";

export default function Accueil() {
  return (
    <main className="flex-1">
      {/* Barre de navigation */}
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="font-bold text-lg text-white">
          OmniComm <span className="text-sky-400">360°</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/docs" className="text-sm text-slate-300 hover:text-white">
            Documentation API
          </Link>
          <Link
            href="/connexion"
            className="rounded-md bg-sky-600 hover:bg-sky-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Connexion
          </Link>
        </div>
      </nav>

      {/* En-tête héro */}
      <header className="text-center px-4 pt-10 pb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          PLATEFORME OMNICOMM 360°
        </h1>
        <h2 className="text-3xl md:text-4xl font-extrabold titre-degrade mt-1">
          COMMUNICATION COMPLÈTE
        </h2>
        <p className="mt-4 text-slate-300 font-medium tracking-wide">
          API COMPLÈTE DE COMMUNICATIONS • VOIX • MESSAGES • IoT • RADIO WEB • MVNO
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {BADGES_PLATEFORME.map((b) => (
            <span
              key={b}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border border-violet-500/50 bg-violet-500/15 text-violet-200"
            >
              {b}
            </span>
          ))}
        </div>
      </header>

      {/* Architecture : canaux → cœur → sorties */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-4 items-stretch">
          <div className="carte p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-3">Canaux de communication</div>
            <ul className="space-y-2">
              {CANAUX_ENTRANTS.map((c) => (
                <li key={c} className="flex items-center gap-2 text-sm text-slate-200 border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">
                  <span className="h-2 w-2 rounded-full bg-sky-400" /> {c} <span className="ml-auto text-sky-500">→</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="carte p-5 flex flex-col justify-between border-sky-500/40">
            <div className="text-center">
              <div className="text-xl font-bold text-white">PLATEFORME OMNICOMM 360°</div>
              <div className="text-sm text-sky-300 mt-1">CŒUR DE LA PLATEFORME</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-5">
              {MOTEURS.map((m) => (
                <div key={m.nom} className="border border-[#1c2a4a] rounded-md bg-[#0a1120] p-2 text-center">
                  <div className={`text-[11px] font-bold uppercase leading-tight ${m.couleur}`}>{m.nom}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
              {COUCHE_DONNEES.map((d) => (
                <div key={d} className="border border-[#1c2a4a] rounded-md bg-[#0a1120] p-2 text-center text-[11px] text-slate-300">
                  {d}
                </div>
              ))}
            </div>
          </div>

          <div className="carte p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-3">Destinations & partenaires</div>
            <ul className="space-y-2">
              {SORTIES.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-slate-200 border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">
                  <span className="text-sky-500">→</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Les 5 domaines / 24 modules RF */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DOMAINES.map((d) => {
            const a = ACCENTS[d.couleur];
            return (
              <div key={d.numero} className={`carte p-4 ${a.bord}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${a.fond} ${a.texte}`}>{d.numero}</span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">{d.nom}</h3>
                </div>
                <ul className="space-y-2">
                  {d.modules.map((m) => (
                    <li key={m.rf}>
                      <div className="flex items-start gap-3 border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">
                        <span className={`text-[11px] font-mono font-bold mt-0.5 ${a.texte}`}>{m.rf}</span>
                        <div>
                          <div className="text-sm text-slate-100 leading-tight">{m.titre}</div>
                          <div className="text-xs text-slate-500">{m.sousTitre}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Sécurité & conformité */}
          <div className="carte p-4 border-emerald-500/40">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">🛡</span>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Sécurité & Conformité</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SECURITE_CONFORMITE.map((s) => (
                <div key={s} className="border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120] text-sm text-slate-200 text-center">
                  {s}
                </div>
              ))}
            </div>
            <div className="mt-3 border border-amber-500/30 rounded-md px-3 py-2 bg-amber-500/5 text-center text-amber-200 text-sm font-semibold">
              {SLOGAN}
            </div>
          </div>
        </div>
      </section>

      {/* Expérience développeur + flux + cas d'utilisation */}
      <section className="max-w-7xl mx-auto px-4 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="carte p-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3">Expérience Développeur</h3>
          <ul className="space-y-2">
            {EXPERIENCE_DEV.map((e) => (
              <li key={e} className="text-sm text-slate-200 border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120]">
                {e}
              </li>
            ))}
          </ul>
        </div>
        <div className="carte p-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3">Flux d&apos;utilisation (exemple)</h3>
          <ol className="space-y-2 text-sm text-slate-200">
            {[
              "1. Développeur",
              "2. Votre Application",
              "3. API REST / HTTPS",
              "4. Plateforme OmniComm 360°",
              "5. Opérateurs / Passerelles / Partenaires",
              "6. Destination Finale (Utilisateur)",
            ].map((e) => (
              <li key={e} className="border border-[#1c2a4a] rounded-md px-3 py-2 bg-[#0a1120] flex items-center gap-2">
                {e} <span className="ml-auto text-sky-500">→</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="carte p-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3">Cas d&apos;utilisation</h3>
          <div className="grid grid-cols-2 gap-2">
            {CAS_UTILISATION.map((c) => (
              <div key={c} className="border border-[#1c2a4a] rounded-md px-3 py-3 bg-[#0a1120] text-center text-sm text-slate-200">
                {c}
              </div>
            ))}
          </div>
          <Link
            href="/connexion"
            className="mt-4 block text-center rounded-md bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Accéder à la console →
          </Link>
        </div>
      </section>

      {/* Pied de page : garanties + slogan */}
      <footer className="border-t border-[#1c2a4a]">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {GARANTIES.map((g) => (
            <span key={g} className="text-sm text-slate-300 flex items-center gap-1.5">
              <span className="text-emerald-400">✔</span> {g}
            </span>
          ))}
        </div>
        <div className="text-center pb-6 px-4">
          <span className="inline-block border border-amber-500/40 rounded-md px-4 py-2 text-amber-300 font-bold text-sm tracking-wide">
            {SLOGAN}
          </span>
          <p className="text-xs text-slate-600 mt-4">
            © 2026 Plateforme OmniComm 360° — Ing. Nzangi Adolphe & Rogerio Celestina Kabongo
          </p>
        </div>
      </footer>
    </main>
  );
}
