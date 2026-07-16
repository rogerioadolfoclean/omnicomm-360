// Migration : statut 'simule' + traçabilité fournisseur — OmniComm 360°
// Corrige le comportement trompeur : en mode démonstration les messages/appels
// étaient marqués 'livre'/'termine' alors qu'aucun envoi physique n'avait lieu.
// Usage : node scripts/migration-statut-simule.js
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const env = fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8");
const url = env.match(/DATABASE_URL="([^"]+)"/)[1];

const SQL = `
-- Messages : autoriser le statut 'simule' + traçabilité de la passerelle
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_statut_check;
ALTER TABLE messages ADD CONSTRAINT messages_statut_check
  CHECK (statut IN ('en_attente','envoye','livre','echoue','rejete_dnd','simule'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS mode_envoi VARCHAR(10) NOT NULL DEFAULT 'demo'
  CHECK (mode_envoi IN ('reel','demo'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS fournisseur_id VARCHAR(64);

-- Appels : idem
ALTER TABLE appels DROP CONSTRAINT IF EXISTS appels_statut_check;
ALTER TABLE appels ADD CONSTRAINT appels_statut_check
  CHECK (statut IN ('initie','sonnerie','en_cours','termine','echoue','sans_reponse','boite_vocale','simule'));
ALTER TABLE appels ADD COLUMN IF NOT EXISTS mode_envoi VARCHAR(10) NOT NULL DEFAULT 'demo'
  CHECK (mode_envoi IN ('reel','demo'));
ALTER TABLE appels ADD COLUMN IF NOT EXISTS fournisseur_id VARCHAR(64);
ALTER TABLE appels ADD COLUMN IF NOT EXISTS erreur TEXT;

-- Routes Angola (RF-001) : le pays était routable mais absent du catalogue initial
INSERT INTO routes_tarifs (canal, pays, prefixe, operateur, cout_par_unite, priorite)
SELECT * FROM (VALUES
  ('sms','Angola','+244','Unitel Angola',0.02400,1),
  ('sms','Angola','+244','Movicel Angola',0.02600,2),
  ('voix','Angola','+244','Unitel Angola',0.11000,1),
  ('whatsapp','Angola','+244','Meta Cloud API',0.03200,1)
) AS v(canal,pays,prefixe,operateur,cout,priorite)
WHERE NOT EXISTS (
  SELECT 1 FROM routes_tarifs r WHERE r.canal = v.canal AND r.operateur = v.operateur
);
`;

(async () => {
  const pool = new Pool({ connectionString: url, max: 2 });
  console.log("Application de la migration…");
  await pool.query(SQL);

  // Rétablir la vérité sur l'historique : tout ce qui a été « livré » sans
  // passerelle configurée n'a jamais été envoyé physiquement.
  const r = await pool.query(
    `UPDATE messages SET statut = 'simule', mode_envoi = 'demo', delivered_at = NULL
     WHERE statut IN ('livre','envoye') AND fournisseur_id IS NULL`
  );
  const a = await pool.query(
    `UPDATE appels SET statut = 'simule', mode_envoi = 'demo'
     WHERE statut = 'termine' AND fournisseur_id IS NULL`
  );
  console.log(`Historique corrigé : ${r.rowCount} messages et ${a.rowCount} appels requalifiés 'simule'.`);

  const routes = await pool.query(`SELECT COUNT(*)::int AS n FROM routes_tarifs WHERE pays = 'Angola'`);
  console.log(`Routes Angola disponibles : ${routes.rows[0].n}`);
  await pool.end();
})().catch((e) => {
  console.error("ERREUR:", e.message);
  process.exit(1);
});
