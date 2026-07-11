import { pool } from "@/lib/db";
import { envoyerMessage } from "@/lib/actions";
import { Carte, CarteStat, EnTetePage, BadgeStatut, Tableau, CHAMP, BOUTON } from "@/components/ui";

/** Page générique d'un canal de messagerie (RF-001 → RF-005). */
export async function ModuleMessagerie({
  rf,
  titre,
  sousTitre,
  canaux,
  canalDefaut,
  avecSujet = false,
  placeholderVers,
  labelDe = "Expéditeur",
  deDefaut = "OmniComm",
}: {
  rf: string;
  titre: string;
  sousTitre: string;
  canaux: string[];
  canalDefaut: string;
  avecSujet?: boolean;
  placeholderVers: string;
  labelDe?: string;
  deDefaut?: string;
}) {
  const [stats, liste, routes] = await Promise.all([
    pool.query(
      `SELECT COUNT(*) AS total,
              COUNT(*) FILTER (WHERE statut = 'livre') AS livres,
              COUNT(*) FILTER (WHERE statut IN ('echoue','rejete_dnd')) AS echecs,
              COALESCE(SUM(cout),0)::numeric(12,4) AS cout
       FROM messages WHERE canal = ANY($1)`,
      [canaux]
    ),
    pool.query(
      `SELECT canal, de, vers, sujet, contenu, statut, categorie, operateur_route, cout, erreur, created_at
       FROM messages WHERE canal = ANY($1) ORDER BY created_at DESC LIMIT 15`,
      [canaux]
    ),
    pool.query(
      `SELECT pays, prefixe, operateur, cout_par_unite, priorite FROM routes_tarifs
       WHERE canal = ANY($1) AND actif ORDER BY pays, cout_par_unite LIMIT 12`,
      [canaux.includes("rcs") ? [...canaux.filter((c) => c !== "rcs"), "sms"] : canaux]
    ),
  ]);
  const s = stats.rows[0];
  const taux = Number(s.total) ? Math.round((Number(s.livres) / Number(s.total)) * 100) : 0;

  return (
    <div>
      <EnTetePage rf={rf} titre={titre} sousTitre={sousTitre} couleur="sky" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CarteStat libelle="Total envoyés" valeur={s.total} couleur="sky" />
        <CarteStat libelle="Livrés" valeur={s.livres} detail={`taux de livraison ${taux}%`} couleur="emerald" />
        <CarteStat libelle="Échecs / rejets DND" valeur={s.echecs} couleur="cyan" />
        <CarteStat libelle="Coût cumulé" valeur={`${s.cout} $`} couleur="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Formulaire d'envoi */}
        <Carte className="lg:col-span-2">
          <h2 className="font-bold text-white mb-3">Envoyer un message</h2>
          <form action={envoyerMessage} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Canal</label>
              <select name="canal" defaultValue={canalDefaut} className={CHAMP}>
                {canaux.map((c) => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Catégorie</label>
              <select name="categorie" className={CHAMP}>
                <option value="transactionnel">Transactionnel</option>
                <option value="marketing">Marketing (soumis DND)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">{labelDe}</label>
              <input name="de" defaultValue={deDefaut} className={CHAMP} />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Destinataire</label>
              <input name="vers" required placeholder={placeholderVers} className={CHAMP} />
            </div>
            {avecSujet && (
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Sujet</label>
                <input name="sujet" placeholder="Sujet du message" className={CHAMP} />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Contenu</label>
              <textarea name="contenu" required rows={3} placeholder="Votre message…" className={CHAMP} />
            </div>
            <div className="md:col-span-2">
              <button className={BOUTON}>Envoyer via la plateforme →</button>
              <p className="text-[11px] text-slate-500 mt-2">
                Routage Least-Cost automatique · vérification DND en temps réel · CDR généré · passerelle opérateur en mode démonstration.
              </p>
            </div>
          </form>
        </Carte>

        {/* Routage Least-Cost */}
        <Carte>
          <h2 className="font-bold text-white mb-3">Routage dynamique (Least-Cost)</h2>
          <ul className="space-y-1.5 text-sm">
            {routes.rows.map((r, i) => (
              <li key={i} className="flex items-center gap-2 border border-[#1c2a4a] rounded-md px-2.5 py-1.5 bg-[#0a1120]">
                <span className="text-xs font-mono text-slate-400">{r.prefixe}</span>
                <span className="text-slate-200 text-xs truncate">{r.operateur}</span>
                <span className="ml-auto text-xs text-emerald-300">{Number(r.cout_par_unite).toFixed(4)} $</span>
              </li>
            ))}
            {routes.rows.length === 0 && <li className="text-slate-500 text-sm">Tarification directe (hors réseau télécom).</li>}
          </ul>
        </Carte>
      </div>

      <h2 className="font-bold text-white mb-3">Historique récent</h2>
      <Tableau
        entetes={["Canal", "De", "Vers", "Contenu", "Catégorie", "Route", "Coût", "Statut", "Date"]}
        lignes={liste.rows.map((m) => [
          <span key="c" className="font-mono text-xs uppercase text-sky-300">{m.canal}</span>,
          <span key="d" className="text-slate-300">{m.de}</span>,
          <span key="v" className="text-slate-200">{m.vers}</span>,
          <span key="t" className="text-slate-400 max-w-56 truncate inline-block" title={m.erreur ?? m.contenu}>
            {m.sujet ? `${m.sujet} — ` : ""}{m.contenu}
          </span>,
          <span key="g" className="text-xs text-slate-400">{m.categorie}</span>,
          <span key="r" className="text-xs text-slate-400">{m.operateur_route ?? "—"}</span>,
          <span key="p" className="text-xs text-amber-200">{Number(m.cout).toFixed(4)} $</span>,
          <BadgeStatut key="s" statut={m.statut} />,
          <span key="dt" className="text-xs text-slate-500">{new Date(m.created_at).toLocaleString("fr-FR")}</span>,
        ])}
      />
    </div>
  );
}
