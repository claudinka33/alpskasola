// lib/email.ts — pošiljanje emailov prek Resend (besedilo se ureja v CRM)

import { sql } from "@vercel/postgres";

type PrijavaEmail = {
  program: string;
  otrok_ime: string;
  otrok_priimek: string;
  otrok_rojstvo?: string | null;
  otrok_znanje?: string | null;
  starsi_ime: string;
  starsi_priimek: string;
  email: string;
  telefon: string;
  naslov?: string | null;
  posta?: string | null;
  opomba?: string | null;
  termin?: string | null;
  cena?: number | null;
};

// Nastavljivo prek Vercel okoljskih spremenljivk:
const FROM = process.env.EMAIL_FROM || "Alpska šola <onboarding@resend.dev>";
const SOLA = process.env.EMAIL_SOLA || "info@alpskasola.com";
// Kam gredo obvestila o novih prijavah (če ni nastavljeno, na EMAIL_SOLA)
const OBVESTILA = process.env.EMAIL_OBVESTILA || SOLA;
// Dodatni prejemnik obvestil SAMO za prijave na rojstni dan (lahko več, ločeno z vejico)
const OBVESTILA_ROJSTNI_DAN =
  process.env.EMAIL_OBVESTILA_ROJSTNI_DAN || "zoja@alpskasola.com";
const LOGO = process.env.EMAIL_LOGO || "https://alpskasola.vercel.app/alpska-logo.png";

const NAVY = "#13294B";
const ORANGE = "#F26B1E";

// Fiksni podatki (vedno enaki — Zoja jih ne spreminja)
const NASLOV_FIRME = "Alpska šola · Tepanje 60";
const TELEFON = "064 230 888";
const SPLETNA = "www.alpskasola.com";

const PRIVZETA_PREDLOGA = {
  zadeva: "Prejeli smo vašo prijavo",
  naslov: "Hvala za prijavo!",
  vsebina:
    "Vašo prijavo smo uspešno prejeli in vas bomo v kratkem kontaktirali z vsemi podrobnostmi.",
};

const znanjeLabel: Record<string, string> = {
  zacetnik: "Začetnik",
  osnovno: "Osnovno znanje",
  srednje: "Srednje znanje",
  napredno: "Napredno znanje",
  tekmovalno: "Tekmovalna raven",
};

async function pridobiPredlogo() {
  try {
    const r = await sql`SELECT zadeva, naslov, vsebina FROM email_predloga WHERE id = 1;`;
    return (r.rows[0] as typeof PRIVZETA_PREDLOGA) || PRIVZETA_PREDLOGA;
  } catch {
    return PRIVZETA_PREDLOGA;
  }
}

function datum(d?: string | null) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("sl-SI", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function posljiEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY ni nastavljen — email preskočen.");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
      reply_to: opts.replyTo,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    console.error("Resend napaka:", res.status, t);
  }
}

function vrstica(oznaka: string, vrednost?: string | number | null) {
  if (vrednost === null || vrednost === undefined || vrednost === "") return "";
  return `<tr>
    <td style="padding:7px 0;color:#64748b;font-size:13px;vertical-align:top;width:42%;">${oznaka}</td>
    <td style="padding:7px 0;color:${NAVY};font-size:13px;font-weight:600;">${vrednost}</td>
  </tr>`;
}

// Fiksna ovojnica: logotip zgoraj + noga z naslovom in spletno stranjo
function ovojnica(vsebina: string) {
  return `<div style="background:#f1f5f9;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
      <div style="padding:22px 28px;border-bottom:1px solid #eef2f7;text-align:center;">
        <img src="${LOGO}" alt="Alpska šola" style="height:46px;width:auto;display:inline-block;" />
      </div>
      <div style="padding:28px;">${vsebina}</div>
      <div style="padding:18px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px;text-align:center;line-height:1.7;">
        ${NASLOV_FIRME} · ${TELEFON}<br>
        <a href="https://${SPLETNA}" style="color:${ORANGE};text-decoration:none;font-weight:600;">${SPLETNA}</a>
      </div>
    </div>
  </div>`;
}

function podatkiTabela(p: PrijavaEmail, programNaziv: string) {
  const opombaHtml = p.opomba ? escapeHtml(p.opomba).replace(/\n/g, "<br>") : "";
  return `<table style="width:100%;border-collapse:collapse;">
    ${vrstica("Program", escapeHtml(programNaziv))}
    ${vrstica("Termin", p.termin ? escapeHtml(p.termin) : "")}
    ${vrstica("Cena", p.cena ? `${p.cena} €` : "")}
    ${vrstica("Otrok / slavljenec", escapeHtml(`${p.otrok_ime} ${p.otrok_priimek}`))}
    ${vrstica("Datum rojstva", datum(p.otrok_rojstvo))}
    ${vrstica("Predznanje", p.otrok_znanje ? (znanjeLabel[p.otrok_znanje] || p.otrok_znanje) : "")}
    ${vrstica("Starš", escapeHtml(`${p.starsi_ime} ${p.starsi_priimek}`))}
    ${vrstica("Email", escapeHtml(p.email))}
    ${vrstica("Telefon", escapeHtml(p.telefon))}
    ${vrstica("Naslov", p.naslov ? escapeHtml(`${p.naslov}${p.posta ? ", " + p.posta : ""}`) : "")}
    ${opombaHtml ? `<tr><td style="padding:10px 0 0;color:#64748b;font-size:13px;" colspan="2">Opomba:<br><span style="color:${NAVY};">${opombaHtml}</span></td></tr>` : ""}
  </table>`;
}

// === Email STARŠU (besedilo iz CRM) ===
export async function posljiPotrditevStarsu(p: PrijavaEmail, programNaziv: string) {
  const t = await pridobiPredlogo();
  const vsebinaHtml = escapeHtml(t.vsebina).replace(/\n/g, "<br>");
  const body = `
    <p style="margin:0 0 12px;color:${NAVY};font-size:21px;font-weight:800;">${escapeHtml(t.naslov)}</p>
    <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">${vsebinaHtml}</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;">
      ${podatkiTabela(p, programNaziv)}
    </div>
    <p style="margin:18px 0 0;color:#475569;font-size:13px;line-height:1.6;">
      Za morebitna vprašanja nas pokličite na <strong style="color:${NAVY};">${TELEFON}</strong>
      ali preprosto odgovorite na ta email.
    </p>`;
  await posljiEmail({
    to: p.email,
    subject: t.zadeva,
    html: ovojnica(body),
    replyTo: SOLA,
  });
}

// Ali gre za prijavo na rojstni dan (slug ali naziv programa vsebuje "rojstn")
function jeRojstniDan(programSlug?: string | null, programNaziv?: string | null) {
  const s = `${programSlug || ""} ${programNaziv || ""}`.toLowerCase();
  return s.includes("rojstn");
}

// === Email ŠOLI (interno obvestilo) ===
export async function posljiObvestiloSoli(p: PrijavaEmail, programNaziv: string) {
  const body = `
    <p style="margin:0 0 8px;color:${ORANGE};font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Nova prijava</p>
    <p style="margin:0 0 18px;color:${NAVY};font-size:20px;font-weight:800;">
      ${escapeHtml(`${p.otrok_ime} ${p.otrok_priimek}`)} — ${escapeHtml(programNaziv)}
    </p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 18px;">
      ${podatkiTabela(p, programNaziv)}
    </div>
    <p style="margin:16px 0 0;color:#94a3b8;font-size:12px;">Na ta email lahko odgovoriš neposredno staršu (Reply).</p>`;

  // Osnovni prejemnik + (samo pri rojstnih dnevih) Zoja
  const prejemniki = [OBVESTILA];
  if (jeRojstniDan(p.program, programNaziv)) {
    for (const e of OBVESTILA_ROJSTNI_DAN.split(",")) {
      const naslov = e.trim();
      if (naslov) prejemniki.push(naslov);
    }
  }
  const unikatni = Array.from(
    new Set(prejemniki.filter(Boolean).map((e) => e.trim().toLowerCase()))
  );

  await posljiEmail({
    to: unikatni,
    subject: `Nova prijava: ${programNaziv} – ${p.otrok_ime} ${p.otrok_priimek}`,
    html: ovojnica(body),
    replyTo: p.email,
  });
}

// === MNOŽIČNE KAMPANJE ===

import crypto from "crypto";

const BAZNI_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://alpskasola.vercel.app";

export function odjavaHash(email: string) {
  const secret = process.env.JWT_SECRET || "change-me";
  return crypto.createHmac("sha256", secret).update(email.trim().toLowerCase()).digest("hex").slice(0, 32);
}

function kampanjaHtml(naslov: string, vsebina: string, email: string) {
  const vsebinaHtml = escapeHtml(vsebina).replace(/\n/g, "<br>");
  const odjavaUrl = `${BAZNI_URL}/api/odjava?e=${encodeURIComponent(email)}&t=${odjavaHash(email)}`;
  const body = `
    ${naslov ? `<p style="margin:0 0 12px;color:${NAVY};font-size:21px;font-weight:800;">${escapeHtml(naslov)}</p>` : ""}
    <p style="margin:0;color:#475569;font-size:14px;line-height:1.7;">${vsebinaHtml}</p>
    <p style="margin:24px 0 0;color:#94a3b8;font-size:11px;">
      Ta email ste prejeli, ker ste del Alpske šole.
      <a href="${odjavaUrl}" style="color:#94a3b8;text-decoration:underline;">Odjava od obvestil</a>
    </p>`;
  return ovojnica(body);
}

// Pošlje paket kampanje (do 100 prejemnikov) prek Resend batch API-ja.
// Vrne število uspešno poslanih.
export async function posljiKampanjoPaket(
  prejemniki: string[],
  zadeva: string,
  naslov: string,
  vsebina: string
): Promise<number> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY ni nastavljen v Vercel nastavitvah.");
  if (prejemniki.length === 0) return 0;

  const emails = prejemniki.slice(0, 100).map((email) => ({
    from: FROM,
    to: [email],
    subject: zadeva,
    html: kampanjaHtml(naslov, vsebina, email),
    reply_to: SOLA,
  }));

  const res = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emails),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Resend napaka ${res.status}: ${t.slice(0, 200)}`);
  }
  return emails.length;
}

// === EMAIL OB POTRDITVI PRIJAVE (besedilo iz CRM, predloga id=2) ===

const PRIVZETA_POTRDITEV = {
  zadeva: "Vaša prijava je potrjena",
  naslov: "Prijava je potrjena! 🎉",
  vsebina:
    "Z veseljem sporočamo, da je prijava vašega otroka potrjena. Vse podrobnosti najdete v povzetku spodaj. Se vidimo!",
};

async function pridobiPredlogoPotrditev() {
  try {
    const r = await sql`SELECT zadeva, naslov, vsebina FROM email_predloga WHERE id = 2;`;
    return (r.rows[0] as typeof PRIVZETA_POTRDITEV) || PRIVZETA_POTRDITEV;
  } catch {
    return PRIVZETA_POTRDITEV;
  }
}

export async function posljiPotrjenoStarsu(p: PrijavaEmail, programNaziv: string) {
  const t = await pridobiPredlogoPotrditev();
  const vsebinaHtml = escapeHtml(t.vsebina).replace(/\n/g, "<br>");
  const body = `
    <p style="margin:0 0 12px;color:${NAVY};font-size:21px;font-weight:800;">${escapeHtml(t.naslov)}</p>
    <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">${vsebinaHtml}</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 18px;">
      ${podatkiTabela(p, programNaziv)}
    </div>
    <p style="margin:18px 0 0;color:#475569;font-size:13px;line-height:1.6;">
      Za morebitna vprašanja nas pokličite na <strong style="color:${NAVY};">${TELEFON}</strong>
      ali preprosto odgovorite na ta email.
    </p>`;
  await posljiEmail({
    to: p.email,
    subject: t.zadeva,
    html: ovojnica(body),
    replyTo: SOLA,
  });
}
