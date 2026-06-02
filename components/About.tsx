import { Shield, Heart, Users, Medal } from "lucide-react";

export default function About() {
  return (
    <section className="bg-blue-50/40 py-16 lg:py-24 border-y border-blue-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Slika */}
          <div className="relative">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-brand-navy/15">
              <img
                src="/zacenja-zgodba.jpg"
                alt="Alpska šola - zgodbe na snegu"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-brand-orange text-white px-6 py-4 rounded-2xl shadow-xl">
              <div className="text-2xl font-extrabold leading-none">15+ let</div>
              <div className="text-xs opacity-90">tradicije</div>
            </div>
          </div>

          {/* Tekst */}
          <div>
            <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
              <span className="w-6 h-px bg-brand-orange" />
              O Alpski šoli
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-brand-navy tracking-tight leading-[1.1] mb-5">
              Tam, kjer se začenjajo zgodbe na snegu.
            </h2>
            <p className="text-base text-slate-600 mb-4 leading-relaxed">
              Alpska šola je šola z dolgoletno tradicijo na področju učenja smučanja,
              bordanja in tekmovalnega smučanja. V zadnjih letih smo dejavnosti
              razširili izven belih poljan: z nami otroci plavajo, rolajo, kolesarijo in planinarijo.
            </p>
            <p className="text-base text-slate-600 mb-7 leading-relaxed">
              Promoviramo pozitiven odnos do snežnih športov in športa nasploh.
              Otroke vzgajamo v samostojne in odgovorne smučarje.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <Feature icon={Shield} title="Varnost na prvem mestu" text="Red, disciplina, odgovornost." />
              <Feature icon={Heart} title="Zabavno učenje" text="Otroci se z veseljem vračajo." />
              <Feature icon={Users} title="Strokovni učitelji" text="30+ usposobljenih trenerjev." />
              <Feature icon={Medal} title="15 let tradicije" text="Zaupanje 10.000+ staršev." />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="bg-orange-100 text-brand-orange p-2.5 rounded-xl shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <strong className="text-sm font-bold text-brand-navy block mb-0.5">{title}</strong>
        <p className="text-xs text-slate-600">{text}</p>
      </div>
    </div>
  );
}
