import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Splošni pogoji in zasebnost | Alpska šola",
  description:
    "Splošni pogoji poslovanja, varstvo osebnih podatkov (GDPR) in politika piškotkov športnega društva Alpska šola.",
};

function Naslov({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-extrabold text-brand-navy mt-10 mb-3 scroll-mt-24">
      {children}
    </h2>
  );
}

function Pod({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-bold text-brand-navy mt-6 mb-2">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-600 leading-relaxed mb-3">{children}</p>;
}

export default function SplosniPogojiPage() {
  return (
    <main>
      <Navbar />
      <PageHero
        badge="Pravno"
        title="Splošni pogoji in zasebnost"
        subtitle="Pogoji uporabe spletne strani, varstvo osebnih podatkov (GDPR) in politika piškotkov."
        bgGradient="from-slate-50 via-gray-50 to-white"
      />

      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <p className="text-xs text-slate-400 mb-2">Zadnja posodobitev: junij 2026</p>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-sm text-slate-600 mb-8">
            Upravljavec spletne strani in vaših podatkov je{" "}
            <strong className="text-brand-navy">Športno društvo Alpska šola</strong>,
            Tepanje 60, 3210 Slovenske Konjice. Kontakt:{" "}
            <a href="mailto:info@alpskasola.com" className="text-brand-orange font-semibold">
              info@alpskasola.com
            </a>{" "}
            · 064 230 888.
          </div>

          {/* 1. SPLOŠNI POGOJI */}
          <Naslov>1. Splošni pogoji poslovanja</Naslov>
          <P>
            Ti splošni pogoji urejajo uporabo spletne strani www.alpskasola.com ter
            prijavo in izvajanje programov športnega društva Alpska šola (v
            nadaljevanju: izvajalec). Z uporabo spletne strani in oddajo prijavnice
            uporabnik potrjuje, da je s pogoji seznanjen in se z njimi strinja.
          </P>

          <Pod>Prijava na programe</Pod>
          <P>
            Prijava prek spletnega obrazca je informativna in ni dokončna, dokler je
            izvajalec ne potrdi. Po prejemu prijave izvajalec uporabnika kontaktira z
            vsemi podrobnostmi (termin, lokacija, cena, način plačila). Pridržujemo si
            pravico do zavrnitve prijave, kadar je program zapolnjen ali iz drugih
            utemeljenih razlogov.
          </P>

          <Pod>Cene in plačilo</Pod>
          <P>
            Cene programov so objavljene informativno. Veljavna cena in način plačila
            sta uporabniku sporočena ob potrditvi prijave. Morebitne ugodnosti in
            popusti veljajo pod pogoji, ki so navedeni ob posameznem programu.
          </P>

          <Pod>Odpoved in odjava</Pod>
          <P>
            Odjavo od programa uporabnik sporoči izvajalcu čim prej na zgornje
            kontaktne podatke. V primeru odpovedi programa s strani izvajalca (npr.
            premajhno število prijav, neugodne vremenske razmere, višja sila) izvajalec
            ponudi nadomestni termin ali povrne morebitno že vplačano kotizacijo.
          </P>

          <Pod>Odgovornost in varnost</Pod>
          <P>
            Udeleženci sodelujejo v programih na lastno odgovornost oziroma odgovornost
            staršev ali skrbnikov. Udeleženci morajo upoštevati navodila vaditeljev in
            uporabljati ustrezno ter brezhibno opremo (npr. čelada pri smučanju).
            Izvajalec ne odgovarja za poškodbe ali škodo, nastalo zaradi neupoštevanja
            navodil ali neustrezne opreme.
          </P>

          <Pod>Spremembe pogojev</Pod>
          <P>
            Izvajalec si pridržuje pravico do sprememb teh splošnih pogojev. Veljavna
            različica je vedno objavljena na tej strani.
          </P>

          {/* 2. GDPR */}
          <Naslov>2. Varstvo osebnih podatkov (GDPR)</Naslov>
          <P>
            Osebne podatke obdelujemo v skladu s Splošno uredbo o varstvu podatkov
            (GDPR) in veljavno slovensko zakonodajo. Upravljavec podatkov je Športno
            društvo Alpska šola, Tepanje 60, 3210 Slovenske Konjice.
          </P>

          <Pod>Katere podatke zbiramo</Pod>
          <P>
            Ob prijavi na program zbiramo: ime in priimek otroka, datum rojstva in
            stopnjo predznanja; ime in priimek starša oziroma skrbnika, e-naslov,
            telefonsko številko in naslov; ter podatke, ki jih navedete v prijavnici
            (izbrani program, termin, opombe). Zbiramo le podatke, ki so potrebni za
            izvedbo programov.
          </P>

          <Pod>Nameni in pravna podlaga obdelave</Pod>
          <P>
            Podatke obdelujemo za: izvedbo in organizacijo programov, komunikacijo z
            udeleženci in starši ter izpolnjevanje zakonskih obveznosti. Pravna podlaga
            je vaša privolitev (čl. 6(1)(a) GDPR), izvajanje pogodbe oziroma ukrepov
            pred sklenitvijo pogodbe (čl. 6(1)(b) GDPR) ter zakonske obveznosti (čl.
            6(1)(c) GDPR).
          </P>

          <Pod>Podatki mladoletnih</Pod>
          <P>
            Ker programi vključujejo otroke, podatke o otroku posreduje starš oziroma
            zakoniti skrbnik, ki s tem soglaša z obdelavo za zgoraj navedene namene.
          </P>

          <Pod>Hramba podatkov</Pod>
          <P>
            Osebne podatke hranimo le toliko časa, kolikor je potrebno za izpolnitev
            namena, za katerega so bili zbrani, oziroma toliko, kolikor zahteva
            veljavna zakonodaja. Po preteku tega obdobja podatke izbrišemo ali
            anonimiziramo.
          </P>

          <Pod>Posredovanje podatkov tretjim osebam</Pod>
          <P>
            Vaših podatkov ne prodajamo. Za delovanje storitve uporabljamo zaupanja
            vredne zunanje obdelovalce (npr. ponudnika gostovanja spletne strani in
            baze ter storitev za pošiljanje e-pošte), ki podatke obdelujejo izključno
            po naših navodilih in v skladu z GDPR. Podatke lahko razkrijemo pristojnim
            organom, kadar to zahteva zakon.
          </P>

          <Pod>Vaše pravice</Pod>
          <P>
            Imate pravico do dostopa do svojih podatkov, popravka, izbrisa („pozaba“),
            omejitve obdelave, ugovora obdelavi in prenosljivosti podatkov ter pravico
            do preklica privolitve. Zahtevo lahko kadar koli pošljete na{" "}
            <a href="mailto:info@alpskasola.com" className="text-brand-orange font-semibold">
              info@alpskasola.com
            </a>
            . Če menite, da obdelava krši predpise, lahko vložite pritožbo pri
            Informacijskem pooblaščencu Republike Slovenije (www.ip-rs.si).
          </P>

          {/* 3. PIŠKOTKI */}
          <Naslov>3. Politika piškotkov</Naslov>
          <P>
            Spletna stran uporablja nujne piškotke, ki so potrebni za pravilno
            delovanje strani (npr. prijava v sistem). Za izboljšanje delovanja lahko
            uporabljamo tudi analitične piškotke, ki nam pomagajo razumeti, kako
            obiskovalci uporabljajo stran.
          </P>
          <P>
            Uporabo piškotkov lahko kadar koli omejite ali onemogočite v nastavitvah
            svojega brskalnika. Ob onemogočenju nekaterih piškotkov posamezne funkcije
            spletne strani morda ne bodo delovale pravilno.
          </P>
        </div>
      </section>

      <Footer />
    </main>
  );
}
