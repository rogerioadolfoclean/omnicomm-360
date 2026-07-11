import { ModuleMessagerie } from "@/components/module-messagerie";

export const dynamic = "force-dynamic";

export default function PageSms() {
  return (
    <ModuleMessagerie
      rf="RF-001"
      titre="SMS — Transactionnel et Marketing"
      sousTitre="Envoi et réception de SMS avec routage dynamique Least-Cost (RF-001)"
      canaux={["sms"]}
      canalDefaut="sms"
      placeholderVers="+243811234567"
    />
  );
}
