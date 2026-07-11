import { ModuleMessagerie } from "@/components/module-messagerie";

export const dynamic = "force-dynamic";

export default function PageFax() {
  return (
    <ModuleMessagerie
      rf="RF-005"
      titre="Fax Digital (FoIP)"
      sousTitre="Envoi et réception de fax numérique via API (RF-005)"
      canaux={["fax"]}
      canalDefaut="fax"
      avecSujet
      placeholderVers="+33145678901"
      labelDe="Numéro émetteur"
      deDefaut="+243815550000"
    />
  );
}
