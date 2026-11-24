// Galerija + YouTube videi programa — vsebina se ureja v CMS: /admin/galerija
// Če za program v CMS-u še ni ničesar, se pokažejo privzete fotografije/videi (če so podani).
import { pridobiGalerijo } from "@/lib/galerija";
import { VideoMreza, type Slika, type Video } from "./GalerijaMreza";
import FotoTrak from "./FotoTrak";
import { Youtube } from "lucide-react";

type Props = {
  programSlug: string;
  privzeteSlike?: Slika[];
  privzetiVidei?: Video[];
  fotoNaslov?: string;
  fotoPodnaslov?: string;
  videoNaslov?: string;
  videoPodnaslov?: string;
  samo?: "slike" | "videi";
};

const YT_KANAL = "https://www.youtube.com/@alpskasola4739";

export default async function GalerijaSekcija({
  programSlug,
  privzeteSlike = [],
  privzetiVidei = [],
  fotoNaslov = "Galerija",
  fotoPodnaslov,
  videoNaslov = "Poglejte nas v akciji",
  videoPodnaslov,
  samo,
}: Props) {
  let slike: Slika[] = [];
  let videi: Video[] = [];
  try {
    const vse = await pridobiGalerijo(programSlug);
    slike = vse.filter((p) => p.tip === "slika").map((p) => ({ url: p.url, naslov: p.naslov }));
    videi = vse.filter((p) => p.tip === "video").map((p) => ({ id: p.url, naslov: p.naslov }));
  } catch {
    // baza nedosegljiva — pokažemo privzeto
  }
  if (slike.length === 0) slike = privzeteSlike;
  if (videi.length === 0) videi = privzetiVidei;
  if (samo === "slike") videi = [];
  if (samo === "videi") slike = [];

  if (slike.length === 0 && videi.length === 0) return null;

  return (
    <>
      {slike.length > 0 && (
        <section className="bg-white pt-10 lg:pt-14 pb-6 lg:pb-8">
          <div className="max-w-7xl 2xl:max-w-[88rem] mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
                <span className="w-6 h-px bg-brand-orange" />
                Utrinki
                <span className="w-6 h-px bg-brand-orange" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-navy">{fotoNaslov}</h2>
              {fotoPodnaslov && (
                <p className="text-slate-600 max-w-2xl mx-auto mt-3 leading-relaxed">{fotoPodnaslov}</p>
              )}
            </div>
          </div>
          <FotoTrak slike={slike} />
        </section>
      )}

      {videi.length > 0 && (
        <section className="bg-brand-navy py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 text-xs font-bold tracking-widest text-brand-orange uppercase mb-3">
                <span className="w-6 h-px bg-brand-orange" />
                Video
                <span className="w-6 h-px bg-brand-orange" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white">{videoNaslov}</h2>
              {videoPodnaslov && (
                <p className="text-white/70 max-w-2xl mx-auto mt-3 leading-relaxed">{videoPodnaslov}</p>
              )}
            </div>
            <VideoMreza videi={videi} />
            <div className="text-center mt-8">
              <a
                href={YT_KANAL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#FF0000] text-white px-5 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition"
              >
                <Youtube size={18} /> Več videov na našem YouTube kanalu
              </a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
