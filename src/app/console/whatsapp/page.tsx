import { ModuleMessagerie } from "@/components/module-messagerie";

export const dynamic = "force-dynamic";

export default function PageWhatsapp() {
  return (
    <ModuleMessagerie
      rf="RF-002"
      titre="WhatsApp Business API et RCS"
      sousTitre="Messages riches et interactifs via Meta Cloud API et protocole RCS (RF-002)"
      canaux={["whatsapp", "rcs"]}
      canalDefaut="whatsapp"
      placeholderVers="+5511987654321"
    />
  );
}
