import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { pool } from "./db";

export const SESSION_COOKIE = "omni_session";
const DUREE_SESSION_S = 8 * 3600; // 8 heures

export type Role = "admin" | "tenant_admin" | "developer" | "viewer";

export type Session = {
  uid: number;
  email: string;
  nom: string;
  role: Role;
  tenantId: number;
  exp: number;
};

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET manquant");
  return s;
}

function signer(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function creerJeton(u: {
  id: number;
  email: string;
  nom: string;
  role: string;
  tenant_id: number;
}): string {
  const s: Session = {
    uid: u.id,
    email: u.email,
    nom: u.nom,
    role: u.role as Role,
    tenantId: u.tenant_id,
    exp: Math.floor(Date.now() / 1000) + DUREE_SESSION_S,
  };
  const payload = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${payload}.${signer(payload)}`;
}

export function verifierJeton(jeton: string | undefined): Session | null {
  if (!jeton) return null;
  const [payload, sig] = jeton.split(".");
  if (!payload || !sig) return null;
  const attendu = signer(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(attendu);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    if (s.exp < Math.floor(Date.now() / 1000)) return null;
    return s;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return verifierJeton(jar.get(SESSION_COOKIE)?.value);
}

/** Exige une session valide (toute la console). */
export async function exigerSession(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/connexion");
  return s;
}

/** Exige un rôle autorisé à écrire (viewer = lecture seule). */
export async function exigerEcriture(): Promise<Session> {
  const s = await exigerSession();
  if (s.role === "viewer") redirect("/console?erreur=lecture-seule");
  return s;
}

export async function exigerAdmin(): Promise<Session> {
  const s = await exigerSession();
  if (s.role !== "admin") redirect("/console?erreur=admin-requis");
  return s;
}

/** Journal d'audit — chaque action sensible est tracée. */
export async function audit(action: string, cible: string | null, details: string | null) {
  const s = await getSession();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "local";
  await pool.query(
    `INSERT INTO audit_log (utilisateur_email,utilisateur_nom,role,action,cible,details,adresse_ip)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [s?.email ?? "anonyme", s?.nom ?? "—", s?.role ?? "—", action, cible, details, ip]
  );
}
