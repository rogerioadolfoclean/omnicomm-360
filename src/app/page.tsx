import Link from "next/link";
import { SLOGAN } from "@/lib/constants";

/* ————— Données fidèles au mockup (icônes + libellés) ————— */

const BADGES = ["API RESTful", "JSON", "HTTPS/TLS", "OAuth 2.0", "Multi-Tenant", "Évolutif"];

type Rf = { rf: string; icone: string; titre: string; sousTitre: string; href: string };

const D31: Rf[] = [
  { rf: "RF-001", icone: "💬", titre: "SMS (Transactionnel et Marketing)", sousTitre: "Routage Dynamique (Least-Cost)", href: "/console/sms" },
  { rf: "RF-002", icone: "📲", titre: "WhatsApp Business API et RCS", sousTitre: "Messages Riches et Interactifs", href: "/console/whatsapp" },
  { rf: "RF-003", icone: "✉️", titre: "E-mail Transactionnel", sousTitre: "API REST & SMTP", href: "/console/email" },
  { rf: "RF-004", icone: "🔔", titre: "Notifications Push", sousTitre: "FCM (Android) & APNS (iOS)", href: "/console/push" },
  { rf: "RF-005", icone: "📠", titre: "Fax Digital (FoIP)", sousTitre: "Envoi et Réception via API", href: "/console/fax" },
  { rf: "RF-006", icone: "🛡️", titre: "Conformité DND, Opt-in/Opt-out", sousTitre: "Gestion en Temps Réel", href: "/console/conformite-dnd" },
];

const D32: Rf[] = [
  { rf: "RF-007", icone: "📞", titre: "Appels Entrants/Sortants, IVR,", sousTitre: "Conférence, SVI, Boîte Vocale", href: "/console/appels" },
  { rf: "RF-008", icone: "🤖", titre: "IA Conversationnelle (TTS/STT + LLM)", sousTitre: "Voix Intelligente et Automatisation", href: "/console/ia-conversationnelle" },
  { rf: "RF-009", icone: "🌐", titre: "SIP Trunking & WebRTC", sousTitre: "Communication dans le Navigateur", href: "/console/sip-webrtc" },
  { rf: "RF-010", icone: "📻", titre: "Radio Web & Podcast", sousTitre: "Streaming HLS / Icecast", href: "/console/radio-web" },
  { rf: "RF-011", icone: "☎️", titre: "STIR/SHAKEN", sousTitre: "Authentification Anti-Spoofing", href: "/console/stir-shaken" },
];

const D33: Rf[] = [
  { rf: "RF-012", icone: "💳", titre: "Gestion des SIM M2M/IoT", sousTitre: "Activation, Suspension, Diagnostic", href: "/console/sims" },
  { rf: "RF-013", icone: "📍", titre: "Géolocalisation (Triangulation)", sousTitre: "Localisation via Antennes GSM", href: "/console/geolocalisation" },
  { rf: "RF-014", icone: "📡", titre: "Consultation de Couverture Réseau", sousTitre: "Par Opérateur et Zone Géographique", href: "/console/couverture" },
  { rf: "RF-015", icone: "🔢", titre: "Numéros Virtuels", sousTitre: "Locaux, Mobiles, Gratuits, Payants", href: "/console/numeros" },
];

const D34: Rf[] = [
  { rf: "RF-016", icone: "⌨️", titre: "Portail du Développeur", sousTitre: "Sandbox, Docs Interactives, Logs", href: "/console/developpeur" },
  { rf: "RF-017", icone: "👥", titre: "Architecture Multi-Tenant", sousTitre: "White Label pour Revendeurs", href: "/console/tenants" },
  { rf: "RF-018", icone: "🧾", titre: "Facturation à la Consommation", sousTitre: "Prépayé / Postpayé via RADIUS", href: "/console/facturation" },
  { rf: "RF-019", icone: "💰", titre: "Revenue Assurance", sousTitre: "Détection de Fraudes et Pertes", href: "/console/revenue-assurance" },
  { rf: "RF-020", icone: "📋", titre: "Interface d'Administration MVNO", sousTitre: "Offres, Profils, Changements de Forfaits", href: "/console/mvno" },
];

const D35: Rf[] = [
  { rf: "RF-021", icone: "🔗", titre: "Webhooks Configurables", sousTitre: "Événements en Temps Réel", href: "/console/webhooks" },
  { rf: "RF-022", icone: "📊", titre: "Analyses Détaillées (Analytics)", sousTitre: "MOS, Taux de Livraison, Coût par Destination", href: "/console/analytics" },
  { rf: "RF-023", icone: "🗄️", titre: "Rétention des CDR et Journaux", sousTitre: "Conformité Réglementaire", href: "/console/cdrs" },
  { rf: "RF-024", icone: "🛡️", titre: "Détection Active des Fraudes", sousTitre: "SIM Box, Appels Frauduleux", href: "/console/anti-fraude" },
];

const CANAUX = [
  { icone: "💬", nom: "SMS" },
  { icone: "📲", nom: "WhatsApp" },
  { icone: "✉️", nom: "E-mail" },
  { icone: "🔔", nom: "Push" },
  { icone: "📞", nom: "Voix / VoIP" },
  { icone: "🌐", nom: "WebRTC" },
  { icone: "📻", nom: "Radio / Streaming" },
  { icone: "💳", nom: "IoT / SIM" },
];

const SORTIES = [
  { icone: "📡", nom: "Opérateurs Télécoms" },
  { icone: "🌍", nom: "Passerelles Internationales" },
  { icone: "☁️", nom: "Fournisseurs Cloud" },
  { icone: "🧩", nom: "Partenaires / API" },
  { icone: "🗄️", nom: "CDR et Journaux" },
  { icone: "📈", nom: "Moteur d'Analyses" },
];

const MOTEURS = [
  { icone: "🔀", nom: ["MOTEUR", "DE ROUTAGE"], couleur: "text-fuchsia-300 border-fuchsia-500/50", lueur: "shadow-[0_0_18px_rgba(217,70,239,0.25)]" },
  { icone: "🧮", nom: ["MOTEUR DE", "FACTURATION"], couleur: "text-sky-300 border-sky-500/50", lueur: "shadow-[0_0_18px_rgba(14,165,233,0.25)]" },
  { icone: "✅", nom: ["MOTEUR", "DE SÉCURITÉ"], couleur: "text-emerald-300 border-emerald-500/50", lueur: "shadow-[0_0_18px_rgba(16,185,129,0.25)]" },
  { icone: "🧠", nom: ["MOTEUR", "D'IA"], couleur: "text-amber-300 border-amber-500/50", lueur: "shadow-[0_0_18px_rgba(245,158,11,0.25)]" },
  { icone: "📈", nom: ["MOTEUR", "D'ANALYSES"], couleur: "text-cyan-300 border-cyan-500/50", lueur: "shadow-[0_0_18px_rgba(34,211,238,0.25)]" },
];

const COUCHE_DONNEES = [
  { icone: "🗃️", nom: "CLUSTER DE BASES DE DONNÉES" },
  { icone: "🗄️", nom: "STOCKAGE CDR" },
  { icone: "⚡", nom: "CACHE (REDIS)" },
  { icone: "🏦", nom: "ENTREPÔT DE DONNÉES" },
];

const SECURITE = [
  { icone: "🔒", nom: "TLS 1.3" },
  { icone: "🔐", nom: "OAuth 2.0" },
  { icone: "⚖️", nom: "RGPD / LGPD" },
  { icone: "🏛️", nom: "ARCEP / ANRT" },
  { icone: "🛡️", nom: "STIR/SHAKEN" },
  { icone: "🕵️", nom: "Anti-Fraude (SIM Box)" },
];

const EXP_DEV = [
  { icone: "📖", nom: "DOCUMENTATION INTERACTIVE" },
  { icone: "🧪", nom: "SANDBOX DE TEST" },
  { icone: "🔑", nom: "CLÉS API & OAUTH" },
  { icone: "📜", nom: "LOGS EN TEMPS RÉEL" },
  { icone: "🧰", nom: "SDKs (JS, PHP, PY, JAVA)" },
];

const FLUX = [
  { icone: "🧑‍💻", nom: "Développeur" },
  { icone: "📱", nom: "Votre Application" },
  { icone: "🔗", nom: "API REST · HTTPS" },
  { icone: "☁️", nom: "PLATEFORME OMNICOMM 360°" },
  { icone: "📡", nom: "Opérateurs / Passerelles / Partenaires" },
  { icone: "👤", nom: "Destination Finale (Utilisateur)" },
];

const CAS = [
  { icone: "🏦", nom: "Fintech" },
  { icone: "🛒", nom: "E-commerce" },
  { icone: "🚚", nom: "Logistique" },
  { icone: "❤️", nom: "Santé" },
  { icone: "🏛️", nom: "Gouvernement" },
  { icone: "🎓", nom: "Éducation" },
];

const GARANTIES = ["HAUTE DISPONIBILITÉ", "ÉVOLUTIVITÉ HORIZONTALE", "INFRASTRUCTURE MONDIALE", "SAUVEGARDE & PRA", "SUPPORT 24/7"];

/* ————— Composants du mockup ————— */

function CarteRf({ m, accent }: { m: Rf; accent: string }) {
  return (
    <Link
      href={m.href}
      className={`flex items-center gap-2.5 rounded-lg border border-[#233457] bg-[#0a1226]/90 px-2.5 py-2 hover:border-sky-400/70 transition-colors`}
    >
      <span className={`text-[11px] font-mono font-bold shrink-0 ${accent}`}>{m.rf}</span>
      <span className="text-base shrink-0">{m.icone}</span>
      <span className="min-w-0">
        <span className="block text-[12px] font-semibold text-slate-100 leading-tight">{m.titre}</span>
        <span className="block text-[10.5px] text-slate-400 leading-tight">{m.sousTitre}</span>
      </span>
    </Link>
  );
}

function PanneauDomaine({
  numero,
  nom,
  entete,
  bord,
  accent,
  modules,
}: {
  numero: string;
  nom: string;
  entete: string;
  bord: string;
  accent: string;
  modules: Rf[];
}) {
  return (
    <section className={`rounded-xl border ${bord} bg-[#0b1430]/80 overflow-hidden`}>
      <div className={`flex items-center gap-2 px-3 py-2 ${entete}`}>
        <span className="text-[11px] font-extrabold bg-white/15 rounded px-1.5 py-0.5">{numero}</span>
        <h2 className="text-[11.5px] font-extrabold tracking-wide uppercase">{nom}</h2>
      </div>
      <div className="p-2.5 space-y-2">
        {modules.map((m) => (
          <CarteRf key={m.rf} m={m} accent={accent} />
        ))}
      </div>
    </section>
  );
}

function RackServeurs() {
  return (
    <div className="grid grid-cols-3 gap-1.5 mt-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-6 rounded-sm border border-[#24406e] bg-[#0a1a38] flex items-center justify-end gap-1 pr-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${i % 3 === 0 ? "bg-emerald-400" : "bg-sky-400"} shadow-[0_0_6px_currentColor]`} />
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500/80" />
        </div>
      ))}
    </div>
  );
}

/* ————— Page ————— */

export default function Accueil() {
  return (
    <main className="flex-1 px-3 py-3 max-w-[1700px] mx-auto w-full">
      {/* Boutons d'accès (discrets, hors mockup) */}
      <div className="flex justify-end gap-2 mb-2">
        <Link href="/docs" className="text-[11px] text-slate-400 hover:text-white border border-[#233457] rounded-md px-2.5 py-1">
          Documentation API
        </Link>
        <Link href="/connexion" className="text-[11px] font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-md px-2.5 py-1">
          Connexion →
        </Link>
      </div>

      {/* ===== Corps du mockup : 3 colonnes ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr_300px] gap-3">
        {/* Colonne gauche : 3.1 + 3.2 */}
        <div className="space-y-3">
          <PanneauDomaine
            numero="3.1"
            nom="Messagerie et Communications Omnicanales"
            entete="bg-gradient-to-r from-sky-700/70 to-sky-900/40 text-sky-100"
            bord="border-sky-500/40"
            accent="text-sky-300"
            modules={D31}
          />
          <PanneauDomaine
            numero="3.2"
            nom="Voix, VoIP et Radio Web"
            entete="bg-gradient-to-r from-violet-700/70 to-violet-900/40 text-violet-100"
            bord="border-violet-500/40"
            accent="text-violet-300"
            modules={D32}
          />
        </div>

        {/* Colonne centrale : titre + architecture + moteurs + données + sécurité */}
        <div className="flex flex-col gap-3">
          {/* Titre */}
          <header className="text-center pt-1">
            <h1 className="text-3xl md:text-[40px] leading-tight font-extrabold text-white tracking-tight drop-shadow-[0_0_25px_rgba(56,189,248,0.35)]">
              PLATEFORME OMNICOMM 360°
            </h1>
            <h2 className="text-2xl md:text-[32px] font-extrabold titre-degrade">COMMUNICATION COMPLÈTE</h2>
            <p className="mt-2 text-[13px] font-bold text-slate-200 tracking-wide">
              API COMPLÈTE DE COMMUNICATIONS • VOIX • MESSAGES • IoT • RADIO WEB • MVNO
            </p>
            <div className="mt-2.5 flex flex-wrap justify-center gap-1.5">
              {BADGES.map((b) => (
                <span key={b} className="text-[11px] font-bold px-3 py-1 rounded-lg border border-violet-400/60 bg-violet-800/40 text-violet-100">
                  {b}
                </span>
              ))}
            </div>
          </header>

          {/* Architecture : canaux → cœur → sorties */}
          <div className="grid grid-cols-[112px_1fr_150px] gap-2 items-stretch flex-1">
            {/* Canaux entrants */}
            <div className="flex flex-col gap-1.5 justify-center">
              {CANAUX.map((c) => (
                <div key={c.nom} className="flex items-center gap-1.5 rounded-lg border border-[#233457] bg-[#0a1226]/90 px-2 py-1.5">
                  <span className="text-sm">{c.icone}</span>
                  <span className="text-[10.5px] font-semibold text-slate-200 leading-tight">{c.nom}</span>
                  <span className="ml-auto text-sky-400 text-[10px]">→</span>
                </div>
              ))}
            </div>

            {/* Cœur de la plateforme (cloud + racks) */}
            <div className="relative rounded-2xl border border-sky-400/50 bg-gradient-to-b from-[#0e2250] via-[#0a1a3e] to-[#081226] p-4 shadow-[0_0_45px_rgba(37,99,235,0.3)] flex flex-col justify-center">
              <div className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent" />
              <div className="text-center">
                <div className="text-lg md:text-xl font-extrabold text-white tracking-wide">☁️ PLATEFORME OMNICOMM 360°</div>
                <div className="text-[12px] font-bold text-sky-300 mt-0.5 tracking-widest">CŒUR DE LA PLATEFORME</div>
              </div>
              <RackServeurs />
              <div className="mt-3 flex justify-center">
                <span className="text-sky-400 text-lg">▼</span>
              </div>
            </div>

            {/* Sorties */}
            <div className="flex flex-col gap-1.5 justify-center">
              {SORTIES.map((s) => (
                <div key={s.nom} className="flex items-center gap-1.5 rounded-lg border border-[#233457] bg-[#0a1226]/90 px-2 py-1.5">
                  <span className="text-[10px] text-sky-400">→</span>
                  <span className="text-sm">{s.icone}</span>
                  <span className="text-[10.5px] font-semibold text-slate-200 leading-tight">{s.nom}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Les 5 moteurs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {MOTEURS.map((m) => (
              <div key={m.nom.join(" ")} className={`rounded-xl border bg-[#0a1226]/90 px-2 py-2.5 text-center ${m.couleur} ${m.lueur}`}>
                <div className="text-xl">{m.icone}</div>
                <div className="text-[10px] font-extrabold leading-tight mt-1">
                  {m.nom[0]}
                  <br />
                  {m.nom[1]}
                </div>
              </div>
            ))}
          </div>

          {/* Couche de données */}
          <div className="rounded-xl border border-[#233457] bg-[#0a1226]/70 p-2 grid grid-cols-2 md:grid-cols-4 gap-2">
            {COUCHE_DONNEES.map((d) => (
              <div key={d.nom} className="flex items-center justify-center gap-1.5 rounded-lg border border-[#233457] bg-[#0b1430] px-2 py-2">
                <span className="text-sm">{d.icone}</span>
                <span className="text-[10px] font-bold text-slate-200 leading-tight">{d.nom}</span>
              </div>
            ))}
          </div>

          {/* Sécurité & conformité */}
          <div className="rounded-xl border border-emerald-500/40 bg-[#0a1226]/70 p-3">
            <div className="text-center text-[12px] font-extrabold text-emerald-200 tracking-wide mb-2">
              🛡️ SÉCURITÉ & CONFORMITÉ
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {SECURITE.map((s) => (
                <div key={s.nom} className="rounded-lg border border-[#233457] bg-[#0b1430] px-1.5 py-2 text-center">
                  <div className="text-lg">{s.icone}</div>
                  <div className="text-[10px] font-semibold text-slate-200 leading-tight mt-1">{s.nom}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite : 3.3 + 3.4 + 3.5 */}
        <div className="space-y-3">
          <PanneauDomaine
            numero="3.3"
            nom="Connectivité & IoT (AgriTech/Minier)"
            entete="bg-gradient-to-r from-emerald-700/70 to-emerald-900/40 text-emerald-100"
            bord="border-emerald-500/40"
            accent="text-emerald-300"
            modules={D33}
          />
          <PanneauDomaine
            numero="3.4"
            nom="Portail Dév. & Administration (BSS/OSS)"
            entete="bg-gradient-to-r from-amber-600/70 to-amber-900/40 text-amber-100"
            bord="border-amber-500/40"
            accent="text-amber-300"
            modules={D34}
          />
          <PanneauDomaine
            numero="3.5"
            nom="Surveillance & Conformité"
            entete="bg-gradient-to-r from-cyan-700/70 to-cyan-900/40 text-cyan-100"
            bord="border-cyan-500/40"
            accent="text-cyan-300"
            modules={D35}
          />
        </div>
      </div>

      {/* ===== Rangée du bas : Expérience dév / Flux / Cas d'utilisation ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr_300px] gap-3 mt-3">
        <section className="rounded-xl border border-[#233457] bg-[#0b1430]/80 p-3">
          <h3 className="text-[12px] font-extrabold text-white tracking-wide text-center mb-2.5">EXPÉRIENCE DÉVELOPPEUR</h3>
          <div className="grid grid-cols-5 gap-1.5">
            {EXP_DEV.map((e) => (
              <div key={e.nom} className="text-center">
                <div className="mx-auto h-11 w-11 rounded-lg border border-[#233457] bg-[#0a1226] flex items-center justify-center text-lg">
                  {e.icone}
                </div>
                <div className="text-[8.5px] font-bold text-slate-300 leading-tight mt-1">{e.nom}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[#233457] bg-[#0b1430]/80 p-3">
          <h3 className="text-[12px] font-extrabold text-white tracking-wide text-center mb-2.5">FLUX D&apos;UTILISATION (EXEMPLE)</h3>
          <div className="flex items-center justify-between gap-1 overflow-x-auto">
            {FLUX.map((f, i) => (
              <div key={f.nom} className="flex items-center gap-1 shrink-0">
                <div className="text-center w-[92px]">
                  <div
                    className={`mx-auto h-11 w-11 rounded-full border flex items-center justify-center text-lg ${
                      i === 3 ? "border-sky-400/70 bg-sky-900/50 shadow-[0_0_16px_rgba(56,189,248,0.4)]" : "border-[#233457] bg-[#0a1226]"
                    }`}
                  >
                    {f.icone}
                  </div>
                  <div className="text-[8.5px] font-bold text-slate-300 leading-tight mt-1">{f.nom}</div>
                </div>
                {i < FLUX.length - 1 && <span className="text-sky-400 text-sm shrink-0">→</span>}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-[#233457] bg-[#0b1430]/80 p-3">
          <h3 className="text-[12px] font-extrabold text-white tracking-wide text-center mb-2.5">CAS D&apos;UTILISATION</h3>
          <div className="grid grid-cols-3 gap-1.5">
            {CAS.map((c) => (
              <div key={c.nom} className="text-center rounded-lg border border-[#233457] bg-[#0a1226] px-1 py-2">
                <div className="text-lg">{c.icone}</div>
                <div className="text-[9.5px] font-bold text-slate-300 leading-tight mt-0.5">{c.nom}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ===== Pied du mockup : garanties + slogan ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3 mt-3 items-stretch">
        <div className="rounded-xl border border-[#233457] bg-[#0b1430]/80 px-4 py-3 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          {GARANTIES.map((g) => (
            <span key={g} className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
              <span className="text-emerald-400">✔</span> {g}
            </span>
          ))}
        </div>
        <div className="rounded-xl border-2 border-amber-500/70 bg-[#1a0f10] px-4 py-3 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <span className="text-amber-300 font-extrabold text-[13px] tracking-wide text-center">{SLOGAN}</span>
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-600 mt-3">
        © 2026 Plateforme OmniComm 360° — Ing. Nzangi Adolphe & Rogerio Celestina Kabongo
      </p>
    </main>
  );
}
