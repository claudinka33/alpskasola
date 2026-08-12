import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { MailX, AlertCircle } from "lucide-react";

export const metadata = { title: "Odjava od obvestil | Alpska šola" };

export default function OdjavaPage({ searchParams }: { searchParams: { napaka?: string } }) {
  const napaka = searchParams?.napaka === "1";
  return (
    <main>
      <Navbar />
      <section className="bg-gradient-to-b from-blue-50 to-white min-h-[60vh] flex items-center py-20">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${napaka ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
            {napaka ? <AlertCircle size={40} /> : <MailX size={40} />}
          </div>
          <h1 className="text-3xl font-extrabold text-brand-navy mb-3">
            {napaka ? "Povezava ni veljavna" : "Odjavljeni ste"}
          </h1>
          <p className="text-slate-600 mb-8">
            {napaka
              ? "Povezava za odjavo ni veljavna ali je potekla. Pišite nam na info@alpskasola.com in vas odjavimo ročno."
              : "Od naših email obvestil ste uspešno odjavljeni. Če se premislite, nam pišite na info@alpskasola.com."}
          </p>
          <Link href="/" className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-3 rounded-xl font-semibold">
            Nazaj na stran
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
