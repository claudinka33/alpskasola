import type { Metadata } from "next";
import TecajStran, { type TecajVsebina } from "@/components/TecajStran";
import { Bus, Utensils, Users, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Tečaj bordanja za otroke | Alpska šola Rogla",
  description:
    "Tečaj bordanja (deskanja na snegu) za otroke od 5. leta naprej na Rogli. 8 sobot od 9h do 15h, organiziran avtobus in kosilo v hotelu Planja.",
};

// SLIKE: zamenjaj poti, ko dobimo nove fotografije (naloži jih v /public/tecaj-bordanja/)
const vsebina: TecajVsebina = {
  programSlug: "tecaj-bordanja",
  hero: {
    badge: "Zimski program",
    naslov: "Tečaj bordanja",
    podnaslov:
      "Za vse mlade deskarje od 5. leta naprej — od prvega stika z desko do samostojne in varne vožnje po urejenih progah.",
  },
  uvod: {
    znacka: "🏂 5 let in več",
    naslov: "Alpska šola — tečaj bordanja",
    odstavki: [
      "Najprej se spoznamo z desko in opremo, se naučimo pravilnega padanja in vstajanja ter drsenja po blagem naklonu.",
      "Sledijo osnovni zavoji, vožnja z vlečnico in sedežnico ter nadgradnja tehnike — od prvih zavojev do samostojne in varne vožnje po urejenih progah.",
    ],
    poudarki: [
      "Paket 8 sobot, od 9h do 15h",
      "Organiziran avtobus: Celje, Arclin, Frankolovo, Zreče",
      "Kosilo s čajem v hotelu Planja",
      "Učenje po korakih, prilagojeno znanju",
      "Medalja in FIS brošura ob zaključku",
    ],
    slika: "/tecaj-bordanja/07.jpg",
    slikaAlt: "Otroci na tečaju bordanja na Rogli",
  },
  fakti: [
    { icon: Bus, naslov: "Organiziran prevoz", besedilo: "Celje (Zlatorog), Arclin (Spar), Frankolovo, Zreče." },
    { icon: Utensils, naslov: "Kosilo vključeno", besedilo: "Toplo kosilo s čajem v hotelu Planja." },
    { icon: Users, naslov: "Majhne skupine", besedilo: "Učenje po korakih, glede na starost in znanje." },
    { icon: CalendarDays, naslov: "8 sobot", besedilo: "Celodnevni tečaj od 9h do 15h." },
  ],
  koraki: [
    { naslov: "Deska in oprema", opis: "Spoznavanje deske in vezi, pravilno padanje in vstajanje." },
    { naslov: "Drsenje", opis: "Drsenje po blagem naklonu in zaustavljanje na robniku." },
    { naslov: "Prvi zavoji", opis: "Osnovni zavoji ter vožnja z vlečnico in sedežnico." },
    { naslov: "Samostojna vožnja", opis: "Povezani zavoji in varna vožnja po urejenih progah." },
  ],
  galerija: {
    naslov: "Utrinki s tečaja bordanja",
    podnaslov:
      "Od prvega sedenja na deski do vožnje skozi zavoje — mladi deskarji na Rogli.",
    slike: [
      { url: "/tecaj-bordanja/07.jpg", naslov: "Prvi dan z desko in učiteljico", w: 1400, h: 930, velika: true },
      { url: "/tecaj-bordanja/01.jpg", naslov: "Prvi koraki z desko", w: 1050, h: 1400 },
      { url: "/tecaj-bordanja/08.jpg", naslov: "Pozdrav s proge", w: 1050, h: 1400 },
      { url: "/tecaj-bordanja/05.jpg", naslov: "Samostojna vožnja", w: 1024, h: 680, velika: true },
      { url: "/tecaj-bordanja/09.jpg", naslov: "Na vlečnici z desko", w: 1050, h: 1400 },
      { url: "/tecaj-bordanja/04.jpg", naslov: "Pripravljen na start", w: 1050, h: 1400 },
      { url: "/tecaj-bordanja/10.jpg", naslov: "Na sedežnici", w: 1050, h: 1400 },
      { url: "/tecaj-bordanja/06.jpg", naslov: "Vstajanje na desko", w: 1024, h: 680, velika: true },
      { url: "/tecaj-bordanja/03.jpg", naslov: "Vožnja skozi zavoj", w: 787, h: 1400 },
      { url: "/tecaj-bordanja/02.jpg", naslov: "Z avtobusom na Roglo", w: 788, h: 1400 },
    ],
  },
  vprasanja: [
    {
      v: "Od katere starosti je tečaj bordanja?",
      o: "Tečaj je primeren za otroke od 5. leta naprej, tako za začetnike kot za tiste, ki že imajo nekaj izkušenj.",
    },
    {
      v: "Kje lahko otrok vstopi na avtobus?",
      o: "Vstopne točke so Celje (Zlatorog), Arclin (Spar), Frankolovo (glavna avtobusna) in Zreče (glavna avtobusna). Vstopno točko izberete na prijavnici.",
    },
    {
      v: "Kaj potrebujejo otroci s sabo?",
      o: "Desko z vezmi, čevlje za bordanje, čelado, očala in rokavice. Priporočamo tudi ščitnike za zapestja. Opremo si lahko izposodite pri nas.",
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
  cta: { naslov: "Prijava na tečaj bordanja", podnaslov: "Mesta so omejena. Rezervirajte mesto za vašega otroka." },
};

export default function TecajBordanjaPage() {
  return <TecajStran v={vsebina} />;
}
