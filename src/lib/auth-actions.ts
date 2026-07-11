"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { pool } from "./db";
import { creerJeton, SESSION_COOKIE, audit } from "./auth";

export type EtatConnexion = { erreur?: string };

export async function seConnecter(
  _prev: EtatConnexion,
  formData: FormData
): Promise<EtatConnexion> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const mdp = String(formData.get("mot_de_passe") ?? "");
  if (!email || !mdp) return { erreur: "Email et mot de passe requis." };

  const r = await pool.query(
    `SELECT id, tenant_id, nom, email, mot_de_passe_hash, role, actif
     FROM utilisateurs WHERE LOWER(email) = $1`,
    [email]
  );
  const u = r.rows[0];
  const ok = u && u.actif && (await bcrypt.compare(mdp, u.mot_de_passe_hash));
  if (!ok) return { erreur: "Identifiants invalides ou compte désactivé." };

  const jar = await cookies();
  jar.set(SESSION_COOKIE, creerJeton(u), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 8 * 3600,
    path: "/",
  });
  await audit("connexion", u.email, "Connexion réussie");
  redirect("/console");
}

export async function seDeconnecter() {
  await audit("deconnexion", null, null);
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/connexion");
}
