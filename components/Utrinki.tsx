import { Facebook, Instagram } from "lucide-react";

const videi = [
  { id: "atf-TQXUdSQ", naslov: "Poletje v Baški" },
  { id: "jOtYv0mTmSc", naslov: "Poletne priprave na Rogli" },
  { id: "W7UljiUO58U", naslov: "Priprave na ledeniku" },
];

const FB = "https://www.facebook.com/alpskasola/";
const IG = "https://www.instagram.com/alpskasola/";

export default function Utrinki() {
  return (
    <section className="bg-blue-50/40 py-16 lg:py-24 border-y border-blue-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-10 lg:mb-14">
          <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
            <span className="w-6 h-px bg-brand-orange" />
            Spremljajte nas
            <span className="w-6 h-px bg-brand-orange" />
          </div>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-brand-navy tracking-tight leading-[1.1] mb-4">
            Utrinki z naših dogodkov
          </h2>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-6">
            Vse naše dogodke, tečaje in tekme sproti objavljamo na Facebooku in
            Instagramu — sledite nam, da ne zamudite ničesar. Spodaj pa nekaj
            video utrinkov.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href={FB}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition"
            >
              <Facebook size={18} /> Facebook
            </a>
            <a
              href={IG}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition"
            >
              <Instagram size={18} /> Instagram
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videi.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm"
            >
              <div className="aspect-video">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${v.id}`}
                  title={v.naslov}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{ border: "none" }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold text-brand-navy">{v.naslov}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
