import type { Metadata } from "next";
import TecajStran, { type TecajVsebina } from "@/components/TecajStran";
import { Bus, Utensils, Users, CalendarDays } from "lucide-react";

// Cenik in termini se berejo iz baze (CMS) — stran se ne sme predpomniti.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Tečaj smučanja za otroke | Alpska šola Rogla",
  description:
    "Tečaj smučanja za otroke od 6. leta naprej na Rogli. 8 sobot od 9h do 15h, organiziran avtobus, kosilo v hotelu Planja, skupine do 6 otrok.",
};

// SLIKE: zamenjaj poti, ko dobimo nove fotografije (naloži jih v /public/tecaj-smucanja/)
const vsebina: TecajVsebina = {
  programSlug: "sola-smucanja",
  hero: {
    badge: "Zimski program",
    naslov: "Tečaj smučanja",
    podnaslov:
      "Otroci od 6. leta naprej z izkušenimi učitelji osvojijo smučanje na varen in igriv način — po starosti in znanju razdeljeni v manjše skupine.",
  },
  uvod: {
    znacka: "⛷️ 6 let in več",
    naslov: "Alpska šola — tečaj smučanja",
    odstavki: [
      "Tečaj za otroke od 6. leta naprej, ki se smučanja učijo prvič ali svoje znanje nadgrajujejo. Začnemo s spoznavanjem in prilagajanjem na opremo, igrami na snegu, drsenjem po hribu, zavijanjem in uporabo žičnice.",
      "Tisti, ki so z osnovami že seznanjeni, se učijo pravilne smučarske tehnike — osnovno vijuganje, ritem smučanja, uporaba palic, smučanje v celcu in v snežnem parku.",
    ],
    poudarki: [
      "Paket 8 sobot, od 9h do 15h",
      "Organiziran avtobus: Celje, Arclin, Frankolovo, Zreče",
      "Kosilo s čajem v hotelu Planja",
      "Skupine do 6 otrok na učitelja",
      "Medalja in FIS brošura ob zaključku",
    ],
    slika: "/tecaj-smucanja/03.jpg",
    slikaAlt: "Otroci na tečaju smučanja na Rogli",
  },
  fakti: [
    { icon: Bus, naslov: "Organiziran prevoz", besedilo: "Celje (Zlatorog), Arclin (Spar), Frankolovo, Zreče." },
    { icon: Utensils, naslov: "Kosilo vključeno", besedilo: "Toplo kosilo s čajem v hotelu Planja." },
    { icon: Users, naslov: "Majhne skupine", besedilo: "Do 6 otrok na učitelja — po starosti in znanju." },
    { icon: CalendarDays, naslov: "8 sobot", besedilo: "Celodnevni tečaj od 9h do 15h." },
  ],
  koraki: [
    { naslov: "Oprema in sneg", opis: "Spoznavanje opreme, igre na snegu, hoja in drsenje po ravnem." },
    { naslov: "Prvi zavoji", opis: "Plužni lok, ustavljanje in varna uporaba vlečnice in sedežnice." },
    { naslov: "Vijuganje", opis: "Osnovno vijuganje, ritem smučanja in pravilna uporaba palic." },
    { naslov: "Nadgradnja", opis: "Smučanje v celcu, v snežnem parku in na zahtevnejših progah." },
  ],
  galerija: {
    naslov: "Utrinki s tečaja smučanja",
    podnaslov:
      "Zasnežena Rogla, majhne skupine, nasmejani obrazi in medalja ob koncu sezone — tako je videti sobota z nami.",
    slike: [
      { url: "/tecaj-smucanja/08.jpg", naslov: "Zaključek sezone z medaljami", w: 1400, h: 1050, velika: true },
      { url: "/tecaj-smucanja/03.jpg", naslov: "Pozdrav s proge", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/01.jpg", naslov: "Navodila pred spustom", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/11.jpg", naslov: "Na sedežnici", w: 1400, h: 1050 },
      { url: "/tecaj-smucanja/04.jpg", naslov: "Skupaj na vlečnici", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/07.jpg", naslov: "Jutranje ogrevanje", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/10.jpg", naslov: "Z avtobusom na Roglo", w: 788, h: 1400 },
      { url: "/tecaj-smucanja/06.jpg", naslov: "Skupina pripravljena na spust", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/02.jpg", naslov: "Priprava opreme", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/09.jpg", naslov: "Zabava po smučanju", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/12.jpg", naslov: "Skupina na Rogli", w: 1050, h: 1400 },
      { url: "/tecaj-smucanja/05.jpg", naslov: "Naši učitelji", w: 1050, h: 1400 },
    ],
  },
  vprasanja: [
    {
      v: "Zakaj smučamo od 9h – 15h?",
      o: "Želimo, da postanejo otroci samostojni smučarji in na začetku posvetimo nekaj časa tudi spoznavanju opreme. V času med kosilom se otroci spočijejo. V popoldanskem času se smučišče izprazni, čakalne vrste so krajše in proge samo za nas.",
    },
    {
      v: "Kje lahko otrok vstopi na avtobus?",
      o: "Vstopne točke so Celje (Zlatorog), Arclin (Spar), Frankolovo (glavna avtobusna) in Zreče (glavna avtobusna). Vstopno točko izberete na prijavnici.",
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
      o: "Da, otrok potrebuje svojo karto. Pri nas jo lahko kupite po akcijski ceni 27,50€.",
    },
    {
      v: "Kako je v primeru slabega vremena?",
      o: "Vsakodnevno spremljamo vreme in razmere. V primeru slabega vremena starše pravočasno obvestimo na spletni strani in osebno.",
    },
  ],
  cta: { naslov: "Prijava na tečaj smučanja", podnaslov: "Mesta so omejena. Rezervirajte mesto za vašega otroka." },
};

export default function SolaSmucanjaPage() {
  return <TecajStran v={vsebina} />;
}
