// lib/pravice.ts — kdo vidi kateri del CMS-a.
// Vsak razdelek ima ključ; uporabnik ima seznam ključev, ki jih sme videti.
// Admin vidi vse, ne glede na seznam.

export type Razdelek = {
  kljuc: string;
  pot: string;
  naziv: string;
  skupina: string;
  opis: string;
};

export const RAZDELKI: Razdelek[] = [
  { kljuc: "prijavnica", pot: "/admin/prijavnica", naziv: "Nastavitve prijavnice", skupina: "Prijavnica", opis: "Ureja polja na prijavnici" },
  { kljuc: "email", pot: "/admin/email", naziv: "Sporočilo staršem", skupina: "Prijavnica", opis: "Besedilo potrditvenega emaila" },
  { kljuc: "prijave", pot: "/admin/prijave", naziv: "Oddane prijave", skupina: "Prijavnica", opis: "Seznam prijavnic, izvoz, brisanje" },

  { kljuc: "prisotnost", pot: "/admin/prisotnost", naziv: "Prisotnost", skupina: "Vodenje skupin", opis: "Vpisovanje prisotnosti na vadbah" },
  { kljuc: "placila", pot: "/admin/placila", naziv: "Plačila", skupina: "Vodenje skupin", opis: "Evidenca plačil in dolžnikov" },
  { kljuc: "ure", pot: "/admin/ure", naziv: "Ure učiteljev", skupina: "Vodenje skupin", opis: "Obračun ur po učiteljih" },

  { kljuc: "kontakti", pot: "/admin/kontakti", naziv: "Kontakti (baza)", skupina: "Obveščanje", opis: "Baza staršev, telefoni in emaili" },
  { kljuc: "kampanje", pot: "/admin/kampanje", naziv: "Emailing", skupina: "Obveščanje", opis: "Pošiljanje emailov staršem" },
  { kljuc: "datoteke", pot: "/admin/datoteke", naziv: "Datoteke", skupina: "Obveščanje", opis: "Slike in dokumenti za emaile" },

  { kljuc: "termini", pot: "/admin/termini", naziv: "Termini", skupina: "Vsebina strani", opis: "Skupine, datumi, oznake" },
  { kljuc: "cenik", pot: "/admin/cenik", naziv: "Cenik", skupina: "Vsebina strani", opis: "Cene na javni strani" },
  { kljuc: "rojstni-dan", pot: "/admin/rojstni-dan", naziv: "Rojstni dan", skupina: "Vsebina strani", opis: "Paketi praznovanj" },

  { kljuc: "programi", pot: "/admin/programi", naziv: "Programi", skupina: "Nastavitve", opis: "Seznam programov šole" },
  { kljuc: "izvoz", pot: "/admin/izvoz", naziv: "Izvoz", skupina: "Nastavitve", opis: "Izvoz podatkov" },
  { kljuc: "admini", pot: "/admin/admini", naziv: "Uporabniki", skupina: "Nastavitve", opis: "Dodajanje uporabnikov in pravic" },
];

export const VSI_KLJUCI = RAZDELKI.map((r) => r.kljuc);

// Pregledna plošča je vedno dostopna
export const VEDNO_DOSTOPNO = ["/admin", "/admin/login"];

export type AdminSPravicami = {
  id: number;
  ime: string;
  email: string;
  vloga: string;
  pravice: string[];
};

export function jeAdmin(a: { vloga?: string } | null) {
  return a?.vloga === "admin";
}

// Ali uporabnik vidi razdelek s tem ključem
export function imaPravico(a: AdminSPravicami | null, kljuc: string) {
  if (!a) return false;
  if (jeAdmin(a)) return true;
  return a.pravice.includes(kljuc);
}

// Ali uporabnik sme na to pot
export function smeNaPot(a: AdminSPravicami | null, pot: string) {
  if (!a) return false;
  if (VEDNO_DOSTOPNO.includes(pot)) return true;
  if (jeAdmin(a)) return true;

  // Najdi razdelek, ki najbolje ustreza poti (npr. /admin/prijave/nova → prijave)
  const zadetek = RAZDELKI.filter((r) => pot === r.pot || pot.startsWith(r.pot + "/")).sort(
    (x, y) => y.pot.length - x.pot.length
  )[0];

  if (!zadetek) return true; // neznana pot pod /admin — ne blokiramo
  return a.pravice.includes(zadetek.kljuc);
}

// Privzete pravice za novega zaposlenega
export const PRIVZETE_ZAPOSLENI = ["prijave", "prisotnost", "kontakti"];
