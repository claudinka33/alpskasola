import { Camera, ShieldCheck, Heart, UserCheck, Medal } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Varnost na prvem mestu",
    description: "Red, disciplina, odgovornost.",
  },
  {
    icon: Heart,
    title: "Zabavno učenje",
    description: "Otroci se z veseljem vračajo.",
  },
  {
    icon: UserCheck,
    title: "Strokovni učitelji",
    description: "30+ usposobljenih trenerjev.",
  },
  {
    icon: Medal,
    title: "15 let tradicije",
    description: "Zaupanje 10.000+ staršev.",
  },
];

export default function About() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-blue-100/60 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left visual */}
          <div className="relative h-[380px] lg:h-[440px]">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-200 to-blue-300 border-2 border-dashed border-brand-navy/20 flex flex-col items-center justify-center gap-2 text-brand-navy">
              <Camera size={50} className="text-brand-orange" />
              <strong className="text-sm font-semibold">
                Prostor za fotografijo
              </strong>
              <span className="text-xs text-slate-600">
                Priporočamo ekipo učiteljev na Rogli
              </span>
            </div>
            {/* Tradition bubble */}
            <div className="absolute -bottom-5 -right-5 bg-brand-orange text-white py-4 px-5 rounded-2xl shadow-2xl shadow-brand-orange/30">
              <strong className="text-2xl font-extrabold block leading-none">
                15+ let
              </strong>
              <span className="text-xs font-medium opacity-90">tradicije</span>
            </div>
          </div>

          {/* Right content */}
          <div>
            <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
              <span className="w-6 h-px bg-brand-orange" />O Alpski šoli
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy tracking-tight leading-[1.15] mb-4">
              Tam, kjer se začenjajo zgodbe na snegu.
            </h2>
            <p className="text-sm lg:text-base text-slate-600 mb-3 leading-relaxed">
              Alpska šola je šola z dolgoletno tradicijo na področju učenja
              smučanja, boardanja in tekmovalnega smučanja. V zadnjih letih smo
              dejavnosti razširili izven belih poljan: z nami otroci plavajo,
              rolajo, kolesarijo in planinarijo.
            </p>
            <p className="text-sm lg:text-base text-slate-600 mb-6 leading-relaxed">
              Promoviramo pozitiven odnos do snežnih športov in športa nasploh.
              Otroke vzgajamo v samostojne in odgovorne smučarje.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="bg-orange-100 text-brand-orange w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={18} />
                    </div>
                    <div>
                      <strong className="block text-sm font-bold text-brand-navy mb-0.5">
                        {feature.title}
                      </strong>
                      <span className="text-xs text-slate-600">
                        {feature.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
