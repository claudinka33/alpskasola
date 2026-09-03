import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { sql } from "@vercel/postgres";
import type { AdminSPravicami } from "./pravice";

const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const COOKIE_NAME = "alpska_session";

export async function preveriGeslo(geslo: string, hash: string) {
  return bcrypt.compare(geslo, hash);
}

export function ustvariToken(payload: { id: number; email: string; ime: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function preveriToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; email: string; ime: string };
  } catch {
    return null;
  }
}

export async function pridobiTrenutniAdmin() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return preveriToken(token);
}

export async function nastaviSession(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function pocistiSession() {
  cookies().delete(COOKIE_NAME);
}

// Sveži podatki o prijavljenem uporabniku, skupaj z vlogo in pravicami.
// Beremo iz baze, da sprememba pravic velja takoj, brez ponovne prijave.
export async function pridobiAdminaSPravicami(): Promise<AdminSPravicami | null> {
  const osnova = await pridobiTrenutniAdmin();
  if (!osnova) return null;
  try {
    await sql`ALTER TABLE admini ADD COLUMN IF NOT EXISTS pravice TEXT;`;
    const r = await sql<{ id: number; ime: string; email: string; vloga: string; pravice: string | null }>`
      SELECT id, ime, email, vloga, pravice FROM admini WHERE id = ${osnova.id};`;
    const a = r.rows[0];
    if (!a) return null;
    let pravice: string[] = [];
    try {
      pravice = a.pravice ? JSON.parse(a.pravice) : [];
    } catch {
      pravice = [];
    }
    return { id: a.id, ime: a.ime, email: a.email, vloga: a.vloga, pravice };
  } catch {
    return { id: osnova.id, ime: osnova.ime, email: osnova.email, vloga: "admin", pravice: [] };
  }
}
