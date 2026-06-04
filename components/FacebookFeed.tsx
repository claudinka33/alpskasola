import { Facebook } from "lucide-react";

const FB_STRAN = "https://www.facebook.com/alpskasola/";

export default function FacebookFeed() {
  const src =
    "https://www.facebook.com/plugins/page.php?href=" +
    encodeURIComponent(FB_STRAN) +
    "&tabs=timeline&width=500&height=700&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true";

  return (
    <section className="bg-blue-50/40 py-16 lg:py-20 border-y border-blue-100">
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
            <span className="w-6 h-px bg-brand-orange" />
            Sledite nam
            <span className="w-6 h-px bg-brand-orange" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy">
            Kaj se dogaja na Facebooku
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Najnovejše novice, slike in utrinki z naših programov.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-[500px] bg-white rounded-2xl border border-slate-200/70 overflow-hidden shadow-sm">
            <iframe
              title="Facebook objave Alpska šola"
              src={src}
              className="w-full"
              height={700}
              style={{ border: "none", overflow: "hidden" }}
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          </div>
        </div>

        <div className="text-center mt-6">
          <a
            href={FB_STRAN}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange hover:underline"
          >
            <Facebook size={16} /> Odpri našo Facebook stran
          </a>
        </div>
      </div>
    </section>
  );
}
