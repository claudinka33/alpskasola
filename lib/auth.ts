import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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
