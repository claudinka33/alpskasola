"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Upload,
  Trash2,
  ImageIcon,
  Youtube,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Plus,
  Check,
} from "lucide-react";

type Program = { id: number; slug: string; naziv: string };
type Postavka = {
  id: number;
  program_slug: string;
  tip: "slika" | "video";
  url: string;
  naslov: string | null;
  vrstni_red: number;
};

// Sliko pred nalaganjem pomanjša (dolga stranica 1800 px, JPEG) — hitrejša stran, manj prostora v bazi
async function pomanjsaj(f: File): Promise<File> {
  if (!f.type.startsWith("image/") || f.type === "image/gif") return f;
  try {
    const bmp = await createImageBitmap(f);
    const MAX = 1800;
    const k = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
    if (k === 1 && f.size < 600 * 1024) return f;
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k);
    c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.82));
    if (!blob) return f;
    return new File([blob], f.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return f;
  }
}

export default function GalerijaAdmin() {
  const [programi, setProgrami] = useState<Program[]>([]);
  const [program, setProgram] = useState("smucarska-akademija");
  const [postavke, setPostavke] = useState<Postavka[]>([]);
  const [berem, setBerem] = useState(true);
  const [nalagam, setNalagam] = useState<string | null>(null);
  const [povezava, setPovezava] = useState("");
  const [videoNaslov, setVideoNaslov] = useState("");
  const [shranjeno, setShranjeno] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/programi")
      .then((r) => r.json())
      .then((d) => setProgrami(d.programi || []))
      .catch(() => {});
  }, []);

  const nalozi = async () => {
    setBerem(true);
    try {
      const d = await fetch(`/api/galerija?program=${program}`).then((r) => r.json());
      setPostavke(d.postavke || []);
    } finally {
      setBerem(false);
    }
  };

  useEffect(() => {
    nalozi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program]);

  const dodajSlike = async (files: FileList) => {
    const seznam = Array.from(files);
    try {
      for (let i = 0; i < seznam.length; i++) {
        setNalagam(`Nalagam ${i + 1} / ${seznam.length} …`);
        const f = await pomanjsaj(seznam[i]);
        const fd = new FormData();
        fd.append("program", program);
        fd.append("datoteka", f);
        const r = await fetch("/api/galerija", { method: "POST", body: fd });
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          alert(`${seznam[i].name}: ${d.error || "nalaganje ni uspelo"}`);
        }
      }
      await nalozi();
    } finally {
      setNalagam(null);
    }
  };

  const dodajVideo = async () => {
    if (!povezava.trim()) return;
    const r = await fetch("/api/galerija", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ program, povezava, naslov: videoNaslov }),
    });
    const d = await r.json();
    if (!r.ok) return alert(d.error || "Napaka");
    setPovezava("");
    setVideoNaslov("");
    nalozi();
  };

  const premakni = async (id: number, smer: "gor" | "dol") => {
    await fetch("/api/galerija", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, smer }),
    });
    nalozi();
  };

  const shraniNaslov = async (p: Postavka, naslov: string) => {
    if ((p.naslov || "") === naslov) return;
    await fetch("/api/galerija", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, naslov }),
    });
    setPostavke((s) => s.map((x) => (x.id === p.id ? { ...x, naslov } : x)));
    setShranjeno(p.id);
    setTimeout(() => setShranjeno(null), 1500);
  };

  const izbrisi = async (p: Postavka) => {
    if (!confirm(p.tip === "slika" ? "Izbrišem to fotografijo?" : "Odstranim ta video s strani?")) return;
    await fetch(`/api/galerija?id=${p.id}`, { method: "DELETE" });
    nalozi();
  };

  const slike = postavke.filter((p) => p.tip === "slika");
  const videi = postavke.filter((p) => p.tip === "video");

  const Gumbi = ({ p, i, n }: { p: Postavka; i: number; n: number }) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => premakni(p.id, "gor")}
        disabled={i === 0}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        aria-label="Naprej"
      >
        <ArrowUp size={16} />
      </button>
      <button
        onClick={() => premakni(p.id, "dol")}
        disabled={i === n - 1}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30"
        aria-label="Nazaj"
      >
        <ArrowDown size={16} />
      </button>
      <button
        onClick={() => izbrisi(p)}
        className="p-2 rounded-lg text-red-500 hover:bg-red-50 ml-auto"
        aria-label="Izbriši"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy flex items-center gap-2">
          <ImageIcon size={26} className="text-brand-orange" /> Galerija in videi
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Fotografije in YouTube videi na javni strani programa. Prva fotografija je prikazana velika.
          Dokler programu ne dodaš ničesar, stran kaže privzete fotografije.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <select
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold bg-white"
        >
          {!programi.some((p) => p.slug === program) && <option value={program}>{program}</option>}
          {programi.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.naziv}
            </option>
          ))}
        </select>
        <a
          href={`/${program}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange hover:underline"
        >
          Odpri stran <ExternalLink size={14} />
        </a>
      </div>

      {/* FOTOGRAFIJE */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-lg font-extrabold text-brand-navy flex items-center gap-2">
            <ImageIcon size={18} /> Fotografije ({slike.length})
          </h2>
          <label className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer hover:opacity-90">
            {nalagam ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {nalagam || "Dodaj fotografije"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={!!nalagam}
              onChange={(e) => {
                if (e.target.files?.length) dodajSlike(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {berem ? (
          <div className="py-10 flex justify-center text-slate-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : slike.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">
            Še ni fotografij. Izberi več slik naenkrat — samodejno se pomanjšajo.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {slike.map((p, i) => (
              <div key={p.id} className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="aspect-square bg-slate-100 relative">
                  <img src={p.url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  {i === 0 && (
                    <span className="absolute top-2 left-2 bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      VELIKA
                    </span>
                  )}
                </div>
                <div className="p-2 space-y-1">
                  <div className="relative">
                    <input
                      defaultValue={p.naslov || ""}
                      placeholder="Opis (neobvezno)"
                      onBlur={(e) => shraniNaslov(p, e.target.value.trim())}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 pr-6"
                    />
                    {shranjeno === p.id && (
                      <Check size={14} className="absolute right-1.5 top-1.5 text-green-600" />
                    )}
                  </div>
                  <Gumbi p={p} i={i} n={slike.length} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* VIDEI */}
      <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
        <h2 className="text-lg font-extrabold text-brand-navy flex items-center gap-2 mb-4">
          <Youtube size={18} className="text-[#FF0000]" /> YouTube videi ({videi.length})
        </h2>

        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2 mb-5">
          <input
            value={povezava}
            onChange={(e) => setPovezava(e.target.value)}
            placeholder="Prilepi YouTube povezavo"
            className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
          />
          <input
            value={videoNaslov}
            onChange={(e) => setVideoNaslov(e.target.value)}
            placeholder="Naslov (npr. Tabor v Baški 2026)"
            className="border border-slate-300 rounded-xl px-3 py-2.5 text-sm"
          />
          <button
            onClick={dodajVideo}
            className="inline-flex items-center justify-center gap-2 bg-brand-navy text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90"
          >
            <Plus size={16} /> Dodaj
          </button>
        </div>

        {!berem && videi.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">Še ni videov.</p>
        ) : (
          <div className="space-y-3">
            {videi.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-2">
                <img
                  src={`https://i.ytimg.com/vi/${p.url}/mqdefault.jpg`}
                  alt=""
                  className="w-28 sm:w-36 aspect-video object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <input
                    defaultValue={p.naslov || ""}
                    placeholder="Naslov videa"
                    onBlur={(e) => shraniNaslov(p, e.target.value.trim())}
                    className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5"
                  />
                  <Gumbi p={p} i={i} n={videi.length} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
