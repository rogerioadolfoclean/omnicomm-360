"use client";

import { useActionState } from "react";
import Link from "next/link";
import { seConnecter, type EtatConnexion } from "@/lib/auth-actions";
import { CHAMP, BOUTON } from "@/components/ui";

export default function Connexion() {
  const [etat, action, enCours] = useActionState<EtatConnexion, FormData>(seConnecter, {});

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="font-bold text-2xl text-white">
            OmniComm <span className="text-sky-400">360°</span>
          </Link>
          <p className="text-slate-400 text-sm mt-2">
            Console de la plateforme — accès réservé aux comptes autorisés
          </p>
        </div>
        <form action={action} className="carte p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-slate-300 mb-1">Adresse e-mail</label>
            <input id="email" name="email" type="email" required autoComplete="email"
              placeholder="vous@entreprise.cd" className={CHAMP} />
          </div>
          <div>
            <label htmlFor="mot_de_passe" className="block text-sm text-slate-300 mb-1">Mot de passe</label>
            <input id="mot_de_passe" name="mot_de_passe" type="password" required
              autoComplete="current-password" placeholder="••••••••" className={CHAMP} />
          </div>
          {etat.erreur && (
            <p className="text-sm text-rose-300 border border-rose-500/30 bg-rose-500/10 rounded-md px-3 py-2">
              {etat.erreur}
            </p>
          )}
          <button type="submit" disabled={enCours} className={`${BOUTON} w-full justify-center`}>
            {enCours ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <p className="text-center text-xs text-slate-500 mt-4">
          Session sécurisée (cookie httpOnly signé HMAC, 8 h) — chaque action sensible est auditée.
        </p>
      </div>
    </main>
  );
}
