import { ModuleMessagerie } from "@/components/module-messagerie";

export const dynamic = "force-dynamic";

export default function PagePush() {
  return (
    <ModuleMessagerie
      rf="RF-004"
      titre="Notifications Push"
      sousTitre="Moteur de notifications push FCM (Android) et APNS (iOS) (RF-004)"
      canaux={["push"]}
      canalDefaut="push"
      placeholderVers="device_fcm_8842a"
      labelDe="Application émettrice"
      deDefaut="app-mobile"
    />
  );
}
