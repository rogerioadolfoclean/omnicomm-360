import { pool } from "@/lib/db";
import { attribuerNumero, libererNumero } from "@/lib/actions";
import { CarteStat, EnTetePage, BadgeStatut, Tableau, BOUTON_DISCRET } from "@/components/ui";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  local: "Local",
  mobile: "Mobile",
  gratuit: "Gratuit (numéro vert)",
  surtaxe: "Surtaxé (payant)",
};

export default async function PageNumeros() {
  const numeros = await pool.query(
    `SELECT n.*, t.nom AS tenant FROM numeros_virtuels n
     LEFT JOIN tenants t ON t.id = n.tenant_id ORDER BY n.statut, n.pays, n.numero`
  );
  const attribues = numeros.rows.filter((n) => n.statut === "attribue");
  const disponibles = numeros.rows.filter((n) => n.statut === "disponible");

  return (
    <div>
      <EnTetePage
        rf="RF-015"
        titre="Numéros Virtuels"
        sousTitre="Provisionnement international : numéros locaux, mobiles, gratuits et surtaxés (RF-015)"
        couleur="emerald"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <CarteStat libelle="Numéros attribués" valeur={attribues.length} couleur="emerald" />
        <CarteStat libelle="Disponibles à l'achat" valeur={disponibles.length} couleur="sky" />
        <CarteStat libelle="Pays couverts" valeur={new Set(numeros.rows.map((n) => n.pays)).size} couleur="violet" />
        <CarteStat
          libelle="Coût mensuel total"
          valeur={`${attribues.reduce((s, n) => s + Number(n.cout_mensuel), 0).toFixed(2)} $`}
          couleur="amber"
        />
      </div>

      <h2 className="font-bold text-white mb-3">Inventaire des numéros</h2>
      <Tableau
        entetes={["Numéro", "Pays", "Type", "Capacités", "Coût/mois", "Tenant", "Statut", "Action"]}
        lignes={numeros.rows.map((n) => [
          <span key="n" className="font-mono text-slate-100">{n.numero}</span>,
          <span key="p" className="text-xs text-slate-300">{n.pays}</span>,
          <span key="t" className="text-xs text-emerald-300">{TYPES[n.type]}</span>,
          <span key="c" className="text-xs text-slate-400">{n.capacites.join(" + ")}</span>,
          <span key="co" className="text-xs text-amber-200">{Number(n.cout_mensuel).toFixed(2)} $</span>,
          <span key="te" className="text-xs text-slate-400">{n.tenant ?? "—"}</span>,
          <BadgeStatut key="s" statut={n.statut} />,
          n.statut === "disponible" ? (
            <form key="a" action={attribuerNumero}>
              <input type="hidden" name="id" value={n.id} />
              <button className={BOUTON_DISCRET}>Attribuer à mon tenant</button>
            </form>
          ) : n.statut === "attribue" ? (
            <form key="a" action={libererNumero}>
              <input type="hidden" name="id" value={n.id} />
              <button className={BOUTON_DISCRET}>Libérer</button>
            </form>
          ) : (
            <span key="a" className="text-xs text-slate-600">—</span>
          ),
        ])}
      />
    </div>
  );
}
