import type { Metadata } from "next";
import TecajStran, { type TecajVsebina } from "@/components/TecajStran";
import { Bus, Utensils, Users, CalendarDays } from "lucide-react";

// Cenik in termini se berejo iz baze (CMS) — stran se ne sme predpomniti.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Alpska šola smučanja za otroke | Rogla",
  description:
    "Alpska šola smučanja za otroke od 6. leta naprej na Rogli. 8 sobot od 9h do 15h (od 9. 1. 2027), organiziran avtobus, kosilo v hotelu Planja, skupine do 6 otrok.",
};

// SLIKE: zamenjaj poti, ko dobimo nove fotografije (naloži jih v /public/tecaj-smucanja/)
const vsebina: TecajVsebina = {
  programSlug: "sola-smucanja",
  hero: {
    badge: "Zimski program",
    naslov: "Alpska šola smučanja",
    podnaslov:
      "Otroci od 6. leta naprej z izkušenimi učitelji osvojijo smučanje na varen in igriv način — po starosti in znanju razdeljeni v manjše skupine.",
  },
  uvod: {
    znacka: "⛷️ 6 let in več",
    naslov: "Smučanje z Alpsko šolo",
    odstavki: [
      "Tečaj za otroke od 6. leta naprej, ki se smučanja učijo prvič ali svoje znanje nadgrajujejo. Začnemo s spoznavanjem in prilagajanjem na opremo, igrami na snegu, drsenjem po hribu, zavijanjem in uporabo žičnice.",
      "Tisti, ki so z osnovami že seznanjeni, se učijo pravilne smučarske tehnike — osnovno vijuganje, ritem smučanja, uporaba palic, smučanje v celcu in v snežnem parku.",
    ],
    poudarki: [
      "Paket 8 sobot z zaključno prireditvijo, od 9h do 15h",
      "Začnemo v soboto, 9. 1. 2027",
      "Organiziran avtobus: Celje, Arclin, Frankolovo, Zreče",
      "Kosilo v hotelu Planja",
      "Skupine do 6 otrok na učitelja",
      "Medalja in FIS brošura ob zaključku",
    ],
    slika: "/tecaj-smucanja/03.jpg",
    slikaAlt: "Otroci na tečaju smučanja na Rogli",
  },
  fakti: [
    { icon: Bus, naslov: "Organiziran prevoz", besedilo: "Celje 7.30 · Arclin 7.40 · Frankolovo 7.50 · Zreče 8.00. Nazaj ob 15.05." },
    { icon: Utensils, naslov: "Kosilo vključeno", besedilo: "Toplo kosilo s čajem v hotelu Planja." },
    { icon: Users, naslov: "Majhne skupine", besedilo: "Do 6 otrok na učitelja — po starosti in znanju." },
    { icon: CalendarDays, naslov: "8 sobot", besedilo: "Od 9. 1. 2027, od 9h do 15h, z zaključno prireditvijo." },
  ],
  koraki: [
    { naslov: "Oprema in sneg", opis: "Spoznavanje opreme, igre na snegu, hoja in drsenje po ravnem." },
    { naslov: "Prvi zavoji", opis: "Plužni lok, ustavljanje in varna uporaba vlečnice in sedežnice." },
    { naslov: "Vijuganje", opis: "Osnovno vijuganje, ritem smučanja in pravilna uporaba palic." },
    { naslov: "Nadgradnja", opis: "Smučanje v celcu, v snežnem parku in na zahtevnejših progah." },
  ],
  galerija: {
    naslov: "Utrinki iz Alpske šole smučanja",
    podnaslov:
      "Zasnežena Rogla, majhne skupine, nasmejani obrazi in medalja ob koncu sezone — tako je videti sobota z nami.",
    slike: [
      { url: "/tecaj-smucanja/08.jpg", naslov: "Zaključek sezone z medaljami", w: 1400, h: 1050, velika: true },
      { url: "/tecaj-smucanja/03.jpg", naslov: "Pozdrav s proge", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/14.jpg", naslov: "Pripravljeni na spust", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/01.jpg", naslov: "Navodila pred spustom", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/11.jpg", naslov: "Na sedežnici", w: 1400, h: 1050, velika: true },
      { url: "/tecaj-smucanja/04.jpg", naslov: "Skupaj na vlečnici", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/07.jpg", naslov: "Jutranje ogrevanje", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/10.jpg", naslov: "Z avtobusom na Roglo", w: 788, h: 1400 },
      { url: "/tecaj-smucanja/06.jpg", naslov: "Skupina pripravljena na spust", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/02.jpg", naslov: "Priprava opreme", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/09.jpg", naslov: "Zabava po smučanju", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/13.jpg", naslov: "Naš kotiček na Rogli", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/12.jpg", naslov: "Skupina na Rogli", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/05.jpg", naslov: "Naši učitelji", w: 1050, h: 1400 },
    ],
  },
  vprasanja: [
    {
      v: "Koliko stane in kdaj začnemo?",
      o: "Paket 8 sobot z zaključno prireditvijo stane 500 €. Začnemo v soboto, 9. 1. 2027. Smučarska karta ni vključena (pri nas 29 €).",
    },
    {
      v: "Zakaj smučamo od 9h – 15h?",
      o: "Želimo, da postanejo otroci samostojni smučarji in na začetku posvetimo nekaj časa tudi spoznavanju opreme. V času med kosilom se otroci spočijejo. V popoldanskem času se smučišče izprazni, čakalne vrste so krajše in proge samo za nas.",
    },
    {
      v: "Kje lahko otrok vstopi na avtobus?",
      o: "Avtobus odpelje približno ob: 7.30 Celje (Zlatorog), 7.40 Arclin (avtobusna postaja), 7.50 Frankolovo (avtobusna postaja), 8.00 Zreče (avtobusna postaja). Nazaj z Rogle odpelje ob 15.05. Vstopno točko izberete na prijavnici.",
    },
    {
      v: "Kaj potrebujejo otroci s sabo?",
      o: "Smuči, palice, smučarske čevlje, čelado, očala in smučarske rokavice. V nahrbtniku lahko imajo dodatne nogavice in prigrizek.",
    },
    {
      v: "Kje imajo otroci kosilo?",
      o: "Otroci dobijo kosilo v restavraciji hotela Planja. Alergije sporočite vnaprej — dogovorimo se s kuhinjo za poseben obrok.",
    },
    {
      v: "Ali otrok potrebuje smučarsko karto?",
      o: "Da, otrok potrebuje svojo karto — v paket ni vključena. Pri nas jo lahko kupite po promocijski ceni 29 € (redna cena je 32 €).",
    },
    {
      v: "Kako je v primeru slabega vremena?",
      o: "Vreme in razmere spremljamo sproti. Če je tečaj zaradi slabega vremena odpovedan, vas obvestimo že v petek po e-pošti in SMS-u.",
    },
  ],
  cta: { naslov: "Prijava v Alpsko šolo smučanja", podnaslov: "Mesta so omejena. Rezervirajte mesto za vašega otroka." },
};

export default function SolaSmucanjaPage() {
  return <TecajStran v={vsebina} />;
}
