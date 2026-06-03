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
  await posljiEmail({
    to: SOLA,
    subject: `Nova prijava: ${programNaziv} – ${p.otrok_ime} ${p.otrok_priimek}`,
    html: ovojnica(body),
    replyTo: p.email,
  });
}
