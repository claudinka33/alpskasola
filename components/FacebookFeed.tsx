import { Facebook, ArrowRight } from "lucide-react";

const FB_STRAN = "https://www.facebook.com/alpskasola/";

export default function FacebookFeed() {
  const src =
    "https://www.facebook.com/plugins/page.php?href=" +
    encodeURIComponent(FB_STRAN) +
    "&tabs=timeline&width=500&height=640&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=false";

  return (
    <section className="bg-blue-50/40 py-16 lg:py-24 border-y border-blue-100">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Levo: besedilo */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
              <span className="w-6 h-px bg-brand-orange" />
              Sledite nam
            </div>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-brand-navy tracking-tight leading-[1.1] mb-4">
              Kaj se dogaja na Facebooku
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mb-6 max-w-md mx-auto lg:mx-0">
              Sproti objavljamo novice, slike in utrinke z naših tečajev, tekem
              in dogodkov. Spremljajte nas, da ne zamudite ničesar!
            </p>
            <a
              href={FB_STRAN}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#166fe0] transition-colors"
            >
              <Facebook size={18} /> Obišči našo Facebook stran
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Desno: Facebook zid */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[500px] bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm min-h-[640px]">
              <iframe
                title="Facebook objave Alpska šola"
                src={src}
                className="w-full"
                height={640}
                loading="lazy"
                style={{ border: "none", overflow: "hidden" }}
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
