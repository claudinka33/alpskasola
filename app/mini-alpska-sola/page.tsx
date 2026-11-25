import type { Metadata } from "next";
import TecajStran, { type TecajVsebina } from "@/components/TecajStran";
import { Clock, Medal, Bus, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Mini alpska šola — smučanje za otroke 4–6 let | Alpska šola Rogla",
  description:
    "Mini alpska šola: smučanje za najmlajše od 4. do 6. leta na Rogli. 6 sobot od 9.30 do 13.00 in zaključna prireditev z medaljami.",
};

// SLIKE: zamenjaj poti, ko dobimo nove fotografije (naloži jih v /public/mini-alpska-sola/)
const vsebina: TecajVsebina = {
  programSlug: "mini-alpska-sola",
  hero: {
    badge: "Zimski program · 4 – 6 let",
    naslov: "Mini alpska šola",
    podnaslov:
      "Prvi koraki na smučeh za najmlajše. Skozi igro na snegu se malčki navadijo na opremo, naredijo prve zavoje in osvojijo žičnico.",
  },
  uvod: {
    znacka: "🎿 4 – 6 let",
    naslov: "Smučanje skozi igro",
    odstavki: [
      "Program, prilagojen najmlajšim smučarjem od 4. do 6. leta. Skozi igro na snegu se otroci navadijo na smučarsko opremo, naredijo prve zavoje in osvojijo vožnjo z žičnico.",
      "Urnik je krajši in prilagojen zbranosti malčkov — smučamo ob sobotah od 9.30 do 13.00, sezono pa zaključimo s prireditvijo in podelitvijo medalj.",
    ],
    poudarki: [
      "Paket 6 sobot + zaključna prireditev",
      "Smučamo ob sobotah 9.30 – 13.00",
      "Organiziran avtobus: Celje, Arclin, Frankolovo, Zreče",
      "Medalja in FIS brošura",
      "Učenje skozi igro v majhnih skupinah",
    ],
    slika: "/mini-alpska-sola/11.jpg",
    slikaAlt: "Najmlajši smučarji v Mini alpski šoli",
  },
  fakti: [
    { icon: CalendarDays, naslov: "6 sobot", besedilo: "Plus zaključna prireditev ob koncu sezone." },
    { icon: Clock, naslov: "9.30 – 13.00", besedilo: "Krajši urnik, prilagojen malčkom." },
    { icon: Bus, naslov: "Organiziran prevoz", besedilo: "Celje (Zlatorog), Arclin (Spar), Frankolovo, Zreče." },
    { icon: Medal, naslov: "Medalja", besedilo: "Medalja in FIS brošura za vsakega otroka." },
  ],
  koraki: [
    { naslov: "Navajanje na opremo", opis: "Obuvanje čevljev, hoja s smučmi in igre na snegu." },
    { naslov: "Drsenje", opis: "Prvo drsenje po blagem naklonu in ustavljanje v plužnem položaju." },
    { naslov: "Prvi zavoji", opis: "Zavoji skozi igro — med stožci, obroči in figurami." },
    { naslov: "Žičnica", opis: "Varna vožnja s tekočim trakom in vlečnico ter prvi spusti." },
  ],
  galerija: {
    naslov: "Utrinki iz Mini alpske šole",
    podnaslov:
      "Igre na snegu, prvi zavoji in veliko smeha — malčki se smučanja naučijo, ne da bi sploh opazili, da se učijo.",
    slike: [
      { url: "/mini-alpska-sola/15.jpg", naslov: "Pripravljeni na start!", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/01.jpg", naslov: "Nasmejani malčki", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/23.jpg", naslov: "Sneg v zrak!", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/02.jpg", naslov: "Igre v krogu", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/17.jpg", naslov: "Na tekočem traku", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/04.jpg", naslov: "Ples na smučeh", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/30.jpg", naslov: "Z učiteljicama", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/20.jpg", naslov: "V predoru tekočega traku", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/26.jpg", naslov: "Medalja za vsakega", w: 1120, h: 1400 },
      { url: "/mini-alpska-sola/11.jpg", naslov: "Z učiteljico", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/19.jpg", naslov: "Jutranje ogrevanje", w: 720, h: 960 },
      { url: "/mini-alpska-sola/03.jpg", naslov: "Vsak nese svoje smuči", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/21.jpg", naslov: "V vrsti pri vlečnici", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/06.jpg", naslov: "Prvi spusti", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/18.jpg", naslov: "Roke v zrak", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/16.jpg", naslov: "Prihod z avtobusom", w: 720, h: 960 },
      { url: "/mini-alpska-sola/28.jpg", naslov: "Tek po snegu", w: 1344, h: 1349 },
      { url: "/mini-alpska-sola/08.jpg", naslov: "Na sedežnici", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/27.jpg", naslov: "Učiteljica pokaže, malčki ponovijo", w: 1393, h: 1400 },
      { url: "/mini-alpska-sola/10.jpg", naslov: "Samostojno med zastavicami", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/29.jpg", naslov: "Skupina pozdravlja", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/14.jpg", naslov: "Moje prve smuči", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/22.jpg", naslov: "Na startu med zastavami", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/05.jpg", naslov: "Pomoč pri opremi", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/24.jpg", naslov: "Na sedežnici s prijateljem", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/31.jpg", naslov: "Smuči v roke", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/09.jpg", naslov: "V vrsti za učiteljico", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/13.jpg", naslov: "Prvič na vlečnici", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/25.jpg", naslov: "Skupaj ob avtobusu", w: 1120, h: 1400 },
      { url: "/mini-alpska-sola/07.jpg", naslov: "Mali smučar", w: 1050, h: 1400 },
      { url: "/mini-alpska-sola/12.jpg", naslov: "Med zastavicami", w: 1050, h: 1400 },
    ],
  },
  vprasanja: [
    {
      v: "Ali je program primeren za otroke, ki še nikoli niso smučali?",
      o: "Seveda. Mini alpska šola je namenjena prav najmlajšim začetnikom — začnemo čisto od začetka, skozi igro.",
    },
    {
      v: "Zakaj samo do 13.00?",
      o: "Malčki se hitreje utrudijo, zato je urnik krajši. Tako ostanejo zbrani, varni in se smučanja veselijo vsako soboto znova.",
    },
    {
      v: "Kje lahko otrok vstopi na avtobus?",
      o: "Vstopne točke so Celje (Zlatorog), Arclin (Spar), Frankolovo (glavna avtobusna) in Zreče (glavna avtobusna). Vstopno točko izberete na prijavnici.",
    },
    {
      v: "Kaj potrebujejo otroci s sabo?",
      o: "Smuči, smučarske čevlje, čelado, očala in smučarske rokavice. Palice za najmlajše niso potrebne. V nahrbtniku lahko imajo prigrizek in dodatne nogavice.",
    },
    {
      v: "Ali otrok potrebuje smučarsko karto?",
      o: "Za podrobnosti o karti nas pokličite na 064 230 888 — z veseljem vam svetujemo.",
    },
    {
      v: "Kako je v primeru slabega vremena?",
      o: "Vsakodnevno spremljamo vreme in razmere. V primeru slabega vremena starše pravočasno obvestimo na spletni strani in osebno.",
    },
  ],
  cta: { naslov: "Prijava v Mini alpsko šolo", podnaslov: "Mesta so omejena. Rezervirajte mesto za vašega malčka." },
};

export default function MiniAlpskaSolaPage() {
  return <TecajStran v={vsebina} />;
}
