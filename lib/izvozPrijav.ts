// Izvoz seznama prijav v Excel (.xlsx) ali PDF (prek okna za tiskanje → »Shrani kot PDF«).
// Uporablja se v brskalniku (Tečajniki, Izvoz). Ničesar ne zapisuje v bazo.

export type PrijavaZaIzvoz = {
  id: number;
  program: string;
  program_naziv?: string | null;
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
  status: string;
  termin?: string | null;
  oznaka?: string | null;
  dodatno?: Record<string, any> | null;
  ustvarjeno: string;
};

export const STATUS_IME: Record<string, string> = {
  nova: "Nova",
  potrjeno: "Potrjeno",
  placano: "Plačano",
  koncano: "Končano",
  preklicano: "Preklicano",
};

// Skupina/termin, kot ga vidi uporabnik: oznaka skupine, sicer naziv termina
export const skupinaPrijave = (p: { oznaka?: string | null; termin?: string | null }) =>
  (p.oznaka || p.termin || "").trim();

const vstopnaTocka = (p: PrijavaZaIzvoz) => {
  const d = p.dodatno && typeof p.dodatno === "object" ? p.dodatno : {};
  const v = Object.entries(d).find(([k]) => k.toLowerCase().includes("vstopna"))?.[1];
  return v ? String(v) : "";
};

const datum = (d?: string | null) => (d ? new Date(d).toLocaleDateString("sl-SI") : "");

export function vrsticeZaIzvoz(prijave: PrijavaZaIzvoz[], imenaProgramov: Record<string, string> = {}) {
  return prijave.map((p) => ({
    ID: p.id,
    Program: p.program_naziv || imenaProgramov[p.program] || p.program,
    "Skupina / termin": skupinaPrijave(p),
    "Otrok ime": p.otrok_ime,
    "Otrok priimek": p.otrok_priimek,
    Rojstvo: datum(p.otrok_rojstvo),
    Znanje: p.otrok_znanje || "",
    "Starš ime": p.starsi_ime,
    "Starš priimek": p.starsi_priimek,
    Email: p.email,
    Telefon: p.telefon,
    Naslov: p.naslov || "",
    "Pošta": p.posta || "",
    "Vstopna točka": vstopnaTocka(p),
    "Opomba / alergije": p.opomba || "",
    Status: STATUS_IME[p.status] || p.status,
    Oddano: p.ustvarjeno ? new Date(p.ustvarjeno).toLocaleString("sl-SI") : "",
  }));
}

function naloziXLSX(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).XLSX) return resolve((window as any).XLSX);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = () => resolve((window as any).XLSX);
    s.onerror = () => reject(new Error("Nalaganje Excel knjižnice ni uspelo."));
    document.head.appendChild(s);
  });
}

const varnoImeDatoteke = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "prijave";

export async function izvoziExcel(vrstice: Record<string, any>[], ime: string) {
  const XLSX = await naloziXLSX();
  const ws = XLSX.utils.json_to_sheet(vrstice);
  ws["!cols"] = Object.keys(vrstice[0] || {}).map((k) => ({
    wch: Math.min(40, Math.max(k.length + 2, ...vrstice.slice(0, 200).map((v) => String(v[k] ?? "").length + 1))),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Prijave");
  XLSX.writeFile(wb, `${varnoImeDatoteke(ime)}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// Stolpci v PDF (ležeči A4) — najpomembnejši za vodenje skupine
const PDF_STOLPCI = ["Otrok ime", "Otrok priimek", "Rojstvo", "Skupina / termin", "Starš ime", "Starš priimek", "Telefon", "Email", "Vstopna točka", "Opomba / alergije", "Status"];

// Vrne false, če je brskalnik blokiral novo okno
export function izvoziPdf(vrstice: Record<string, any>[], naslov: string, podnaslov = ""): boolean {
  const esc = (v: any) =>
    String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
  const html = `<!doctype html><html lang="sl"><head><meta charset="utf-8"><title>${esc(naslov)}</title>
<style>@page{size:A4 landscape;margin:10mm}body{font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#1B2733;margin:0}
h1{font-size:14px;color:#0C2340;margin:0 0 2px}p{margin:0 0 8px;color:#5B6B7B}table{width:100%;border-collapse:collapse}
th{background:#0C2340;color:#fff;text-align:left;padding:4px;font-size:8.5px}td{padding:3px 4px;border-bottom:1px solid #DDE3EA;vertical-align:top}
tr:nth-child(even) td{background:#F6F8FB}td.st{color:#5B6B7B;width:18px}</style></head><body>
<h1>${esc(naslov)}</h1><p>${esc(podnaslov)}${podnaslov ? " · " : ""}${vrstice.length} otrok · izpisano ${new Date().toLocaleString("sl-SI")}</p>
<table><thead><tr><th>#</th>${PDF_STOLPCI.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>
${vrstice.map((v, i) => `<tr><td class="st">${i + 1}</td>${PDF_STOLPCI.map((c) => `<td>${esc(v[c])}</td>`).join("")}</tr>`).join("")}
</tbody></table><script>window.onload=function(){setTimeout(function(){window.print()},200)}</script></body></html>`;
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
}
