// Registre des 24 exigences fonctionnelles (RF-001 → RF-024) — référence mockup + PRD
export type ModuleRF = {
  rf: string;
  titre: string;
  sousTitre: string;
  href: string;
};

export type Domaine = {
  numero: string;
  nom: string;
  couleur: string; // classe tailwind d'accent
  modules: ModuleRF[];
};

export const DOMAINES: Domaine[] = [
  {
    numero: "3.1",
    nom: "Messagerie et Communications Omnicanales",
    couleur: "sky",
    modules: [
      { rf: "RF-001", titre: "SMS (Transactionnel et Marketing)", sousTitre: "Routage Dynamique (Least-Cost)", href: "/console/sms" },
      { rf: "RF-002", titre: "WhatsApp Business API et RCS", sousTitre: "Messages Riches et Interactifs", href: "/console/whatsapp" },
      { rf: "RF-003", titre: "E-mail Transactionnel", sousTitre: "API REST & SMTP", href: "/console/email" },
      { rf: "RF-004", titre: "Notifications Push", sousTitre: "FCM (Android) & APNS (iOS)", href: "/console/push" },
      { rf: "RF-005", titre: "Fax Digital (FoIP)", sousTitre: "Envoi et Réception via API", href: "/console/fax" },
      { rf: "RF-006", titre: "Conformité DND, Opt-in/Opt-out", sousTitre: "Gestion en Temps Réel", href: "/console/conformite-dnd" },
    ],
  },
  {
    numero: "3.2",
    nom: "Voix, VoIP et Radio Web",
    couleur: "violet",
    modules: [
      { rf: "RF-007", titre: "Appels Entrants/Sortants, IVR", sousTitre: "Conférence, SVI, Boîte Vocale", href: "/console/appels" },
      { rf: "RF-008", titre: "IA Conversationnelle (TTS/STT + LLM)", sousTitre: "Voix Intelligente et Automatisation", href: "/console/ia-conversationnelle" },
      { rf: "RF-009", titre: "SIP Trunking & WebRTC", sousTitre: "Communication dans le Navigateur", href: "/console/sip-webrtc" },
      { rf: "RF-010", titre: "Radio Web & Podcast", sousTitre: "Streaming HLS / Icecast", href: "/console/radio-web" },
      { rf: "RF-011", titre: "STIR/SHAKEN", sousTitre: "Authentification Anti-Spoofing", href: "/console/stir-shaken" },
    ],
  },
  {
    numero: "3.3",
    nom: "Connectivité & IoT (AgriTech/Minier)",
    couleur: "emerald",
    modules: [
      { rf: "RF-012", titre: "Gestion des SIM M2M/IoT", sousTitre: "Activation, Suspension, Diagnostic", href: "/console/sims" },
      { rf: "RF-013", titre: "Géolocalisation (Triangulation)", sousTitre: "Localisation via Antennes GSM", href: "/console/geolocalisation" },
      { rf: "RF-014", titre: "Consultation de Couverture Réseau", sousTitre: "Par Opérateur et Zone Géographique", href: "/console/couverture" },
      { rf: "RF-015", titre: "Numéros Virtuels", sousTitre: "Locaux, Mobiles, Gratuits, Payants", href: "/console/numeros" },
    ],
  },
  {
    numero: "3.4",
    nom: "Portail Dév. & Administration (BSS/OSS)",
    couleur: "amber",
    modules: [
      { rf: "RF-016", titre: "Portail du Développeur", sousTitre: "Sandbox, Docs Interactives, Logs", href: "/console/developpeur" },
      { rf: "RF-017", titre: "Architecture Multi-Tenant", sousTitre: "White Label pour Revendeurs", href: "/console/tenants" },
      { rf: "RF-018", titre: "Facturation à la Consommation", sousTitre: "Prépayé / Postpayé via RADIUS", href: "/console/facturation" },
      { rf: "RF-019", titre: "Revenue Assurance", sousTitre: "Détection de Fraudes et Pertes", href: "/console/revenue-assurance" },
      { rf: "RF-020", titre: "Interface d'Administration MVNO", sousTitre: "Offres, Profils, Changements de Forfaits", href: "/console/mvno" },
    ],
  },
  {
    numero: "3.5",
    nom: "Surveillance & Conformité",
    couleur: "cyan",
    modules: [
      { rf: "RF-021", titre: "Webhooks Configurables", sousTitre: "Événements en Temps Réel", href: "/console/webhooks" },
      { rf: "RF-022", titre: "Analyses Détaillées (Analytics)", sousTitre: "MOS, Taux de Livraison, Coût par Destination", href: "/console/analytics" },
      { rf: "RF-023", titre: "Rétention des CDR et Journaux", sousTitre: "Conformité Réglementaire", href: "/console/cdrs" },
      { rf: "RF-024", titre: "Détection Active des Fraudes", sousTitre: "SIM Box, Appels Frauduleux", href: "/console/anti-fraude" },
    ],
  },
];

export const BADGES_PLATEFORME = ["API RESTful", "JSON", "HTTPS/TLS", "OAuth 2.0", "Multi-Tenant", "Évolutif"];

export const CANAUX_ENTRANTS = ["SMS", "WhatsApp", "E-mail", "Push", "Voix / VoIP", "WebRTC", "Radio / Streaming", "IoT / SIM"];

export const SORTIES = [
  "Opérateurs Télécoms",
  "Passerelles Internationales",
  "Fournisseurs Cloud",
  "Partenaires / API",
  "CDR et Journaux",
  "Moteur d'Analyses",
];

export const MOTEURS = [
  { nom: "Moteur de Routage", couleur: "text-fuchsia-400" },
  { nom: "Moteur de Facturation", couleur: "text-sky-400" },
  { nom: "Moteur de Sécurité", couleur: "text-emerald-400" },
  { nom: "Moteur d'IA", couleur: "text-amber-400" },
  { nom: "Moteur d'Analyses", couleur: "text-cyan-400" },
];

export const COUCHE_DONNEES = ["Cluster de Bases de Données", "Stockage CDR", "Cache (Redis)", "Entrepôt de Données"];

export const SECURITE_CONFORMITE = ["TLS 1.3", "OAuth 2.0", "RGPD / LGPD", "ARCEP / ANRT", "STIR/SHAKEN", "Anti-Fraude (SIM Box)"];

export const EXPERIENCE_DEV = ["Documentation Interactive", "Sandbox de Test", "Clés API & OAuth", "Logs en Temps Réel", "SDKs (JS, PHP, PY, Java)"];

export const CAS_UTILISATION = ["Fintech", "E-commerce", "Logistique", "Santé", "Gouvernement", "Éducation"];

export const GARANTIES = ["Haute Disponibilité", "Évolutivité Horizontale", "Infrastructure Mondiale", "Sauvegarde & PRA", "Support 24/7"];

export const SLOGAN = "VOTRE API. VOTRE ENTREPRISE. SANS LIMITES.";
