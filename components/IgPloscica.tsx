"use client";
import { useEffect, useRef, useState } from "react";
import { Play, Copy } from "lucide-react";
import type { IgObjava } from "@/lib/instagram";

/* Ena ploščica Instagram objave. Video se predvaja sam (brez zvoka, v zanki),
   ko je ploščica na zaslonu; ko gre z zaslona, se ustavi. Prenese se šele,
   ko je blizu. Pri »manj gibanja« v sistemu se predvaja samo ob prehodu z miško. */
export default function IgPloscica({ o }: { o: IgObjava }) {
  const ref = useRef<HTMLVideoElement>(null);
  const ovoj = useRef<HTMLAnchorElement>(null);
  const [blizu, setBlizu] = useState(false);

  useEffect(() => {
    const a = ovoj.current;
    if (!a || !o.video) return;
    if (!("IntersectionObserver" in window)) {
      setBlizu(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setBlizu(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(a);
    return () => io.disconnect();
  }, [o.video]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const manjGibanja = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (manjGibanja || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.5 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [blizu]);

  const igraj = () => ref.current?.play().catch(() => {});

  return (
    <a
      ref={ovoj}
      href={o.povezava}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={o.opis ? o.opis.slice(0, 90) : "Objava na Instagramu"}
      onMouseEnter={o.video ? igraj : undefined}
      className="group relative block aspect-[9/16] overflow-hidden rounded-lg bg-slate-200"
    >
      {o.video && blizu ? (
        <video
          ref={ref}
          src={o.video}
          poster={o.slika}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={o.slika}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {o.tip === "VIDEO" && (
        <span className="absolute right-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-brand-orange text-white">
          <Play size={11} fill="currentColor" className="ml-px" />
        </span>
      )}
      {o.tip === "CAROUSEL_ALBUM" && (
        <span className="absolute right-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-black/55 text-white">
          <Copy size={11} />
        </span>
      )}

      {o.opis && (
        <span className="absolute inset-0 hidden items-end bg-gradient-to-t from-brand-navy/95 via-brand-navy/20 to-transparent p-3 text-xs leading-snug text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:hover)]:flex">
          <span className="line-clamp-4">{o.opis}</span>
        </span>
      )}
    </a>
  );
}
