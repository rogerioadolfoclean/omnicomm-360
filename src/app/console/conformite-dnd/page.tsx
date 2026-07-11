import { pool } from "@/lib/db";
import { ajouterOptOut, retirerOptOut } from "@/lib/actions";
import { Carte, CarteStat, EnTetePage, Tableau, CHAMP, BOUTON, BOUTON_DISCRET } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PageDnd() {
  const [optouts, rejets] = await Promise.all([
    pool.query(`SELECT o.id, o.canal, o.identifiant, o.source, o.created_at, t.nom AS tenant
      FROM optouts o JOIN tenants t ON t.id = o.tenant_id ORDER BY o.created_at DESC LIMIT 50`),
    pool.query(`SELECT COUNT(*) AS n FROM messages WHERE statut = 'rejete_dnd'`),
  ]);

  return (
    <div>
      <EnTetePage
        rf="RF-006"
        titre="Conformité DND, Opt-in / Opt-out"
        sousTitre="Gestion en temps réel des listes Do Not Disturb — les messages marketing vers un opt-out sont automatiquement rejetés (RF-006)"
        couleur="sky"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <CarteStat libelle="Inscrits en opt-out" valeur={optouts.rows.length} couleur="sky" />
        <CarteStat libelle="Messages bloqués (DND)" valeur={rejets.rows[0].n} detail="rejet automatique en temps réel" couleur="cyan" />
        <CarteStat libelle="Canaux couverts" valeur="6" detail="SMS, WhatsApp, e-mail, push, fax, voix" couleur="emerald" />
      </div>

      <Carte className="mb-6">
        <h2 className="font-bold text-white mb-3">Inscrire un identifiant en opt-out</h2>
        <form action={ajouterOptOut} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Canal</label>
            <select name="canal" className={CHAMP}>
              {["sms", "whatsapp", "email", "push", "fax", "voix"].map((c) => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-52">
            <label className="block text-xs text-slate-400 mb-1">Téléphone ou e-mail</label>
            <input name="identifiant" required placeholder="+243818889977 ou client@exemple.cd" className={CHAMP} />
          </div>
          <button className={BOUTON}>Ajouter à la liste DND</button>
        </form>
      </Carte>

      <h2 className="font-bold text-white mb-3">Liste DND active</h2>
      <Tableau
        entetes={["Canal", "Identifiant", "Tenant", "Source", "Inscrit le", "Action"]}
        lignes={optouts.rows.map((o) => [
          <span key="c" className="font-mono text-xs uppercase text-sky-300">{o.canal}</span>,
          <span key="i" className="text-slate-200">{o.identifiant}</span>,
          <span key="t" className="text-xs text-slate-400">{o.tenant}</span>,
          <span key="s" className="text-xs text-slate-400">{o.source}</span>,
          <span key="d" className="text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString("fr-FR")}</span>,
          <form key="a" action={retirerOptOut}>
            <input type="hidden" name="id" value={o.id} />
            <button className={BOUTON_DISCRET}>Retirer (opt-in)</button>
          </form>,
        ])}
      />
    </div>
  );
}
