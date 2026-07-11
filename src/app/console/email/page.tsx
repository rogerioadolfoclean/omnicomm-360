import { ModuleMessagerie } from "@/components/module-messagerie";

export const dynamic = "force-dynamic";

export default function PageEmail() {
  return (
    <ModuleMessagerie
      rf="RF-003"
      titre="E-mail Transactionnel"
      sousTitre="Envoi d'e-mails transactionnels via API REST et protocole SMTP (RF-003)"
      canaux={["email"]}
      canalDefaut="email"
      avecSujet
      placeholderVers="client@exemple.cd"
      labelDe="Adresse expéditrice"
      deDefaut="noreply@omnicomm360.cd"
    />
  );
}
