"use client";

// Tečajniki — master–detail: levo seznam z iskalnikom in filtri, desno kartica zapisa.
// Kartica je samo za branje; urejanje ostane na obstoječih straneh (Uredi prijavo, Plačila, Prisotnost).
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronRight, ArrowLeft, Pencil, Mail, Phone, Printer, ExternalLink, Loader2, FileText, FileSpreadsheet } from "lucide-react";
import { izvoziExcel, izvoziPdf, skupinaPrijave, vrsticeZaIzvoz, type PrijavaZaIzvoz } from "@/lib/izvozPrijav";

type Vrstica = PrijavaZaIzvoz & {
  id: number; program: string; program_naziv: string; otrok_ime: string; otrok_priimek: string;
  otrok_rojstvo: string | null; starsi_ime: string; starsi_priimek: string; email: string; telefon: string;
  status: string; oznaka: string | null; termin: string | null; ustvarjeno: string;
};

const STATUSI: Record<string, { label: string; slog: string }> = {
  nova: { label: "Nova", slog: "bg-[#FFEDD5] text-[#9A3412]" },
  potrjeno: { label: "Potrjeno", slog: "bg-[#DBEAFE] text-[#1E3A8A]" },
  placano: { label: "Plačano", slog: "bg-[#DCFCE7] text-[#14532D]" },
  koncano: { label: "Končano", slog: "bg-[#EEF1F5] text-[#334155]" },
  preklicano: { label: "Preklicano", slog: "bg-[#FEE2E2] text-[#991B1B]" },
};

const datum = (d?: string | null) => (d ? new Date(d).toLocaleDateString("sl-SI") : "—");
const starost = (d?: string | null) => {
  if (!d) return "—";
  const r = new Date(d);
  if (isNaN(r.getTime())) return "—";
  const n = new Date();
  let l = n.getFullYear() - r.getFullYear();
  if (n < new Date(n.getFullYear(), r.getMonth(), r.getDate())) l--;
  return `${l} let`;
};
const evri = (z: any) => (z == null || z === "" ? "—" : `${Number(z).toFixed(2).replace(".", ",")} €`);

function Znacka({ status }: { status: string }) {
  const s = STATUSI[status] || { label: status, slog: "bg-[#EEF1F5] text-[#334155]" };
  return <span className={`whitespace-nowrap rounded-[3px] px-1.5 py-px text-[10px] font-semibold ${s.slog}`}>{s.label}</span>;
}

// Enotna tabela: glava, vrstice, klik na vrstico pokaže podrobnosti
function Tabela({ stolpci, vrstice, prazno }: {
  stolpci: string[];
  vrstice: { celice: React.ReactNode[]; podrobno?: [string, React.ReactNode][] }[];
  prazno: string;
}) {
  const [odprta, setOdprta] = useState<number | null>(null);
  if (vrstice.length === 0) return <div className="px-3 py-3 text-[12px] text-[#5B6B7B]">{prazno}</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[12px]">
        <thead>
          <tr className="border-b border-[#DDE3EA]">
            <th className="w-5" />
            {stolpci.map((s) => (
              <th key={s} className="whitespace-nowrap px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.05em] text-[#5B6B7B]">{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {vrstice.map((v, i) => (
            <FragmentVrstica key={i} v={v} odprta={odprta === i} preklopi={() => setOdprta(odprta === i ? null : i)} st={stolpci.length} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FragmentVrstica({ v, odprta, preklopi, st }: {
  v: { celice: React.ReactNode[]; podrobno?: [string, React.ReactNode][] }; odprta: boolean; preklopi: () => void; st: number;
}) {
  const ima = !!v.podrobno?.length;
  return (
    <>
      <tr
        onClick={ima ? preklopi : undefined}
        className={`border-b border-[#EEF1F5] ${ima ? "cursor-pointer hover:bg-[#F6F8FB]" : ""} ${odprta ? "bg-[#FFF7F1]" : ""}`}
      >
        <td className="pl-2 text-[#5B6B7B]">{ima ? odprta ? <ChevronDown size={12} /> : <ChevronRight size={12} /> : null}</td>
        {v.celice.map((c, j) => (
          <td key={j} className="whitespace-nowrap px-2 py-1.5">{c}</td>
        ))}
      </tr>
      {odprta && ima && (
        <tr className="border-b border-[#F1E2D6] bg-[#FFF7F1]">
          <td />
          <td colSpan={st} className="px-2 py-2">
            <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
              {v.podrobno!.map(([k, val]) => (
                <div key={k} className="min-w-0 break-words"><span className="text-[#5B6B7B]">{k}:</span> <strong className="font-semibold">{val}</strong></div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Sekcija({ id, ime, st, odprta, preklopi, children }: {
  id: string; ime: string; st: number | string; odprta: boolean; preklopi: () => void; children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-14 rounded border border-[#DDE3EA] bg-white">
      <button
        onClick={preklopi}
        aria-expanded={odprta}
        className={`flex w-full items-center gap-1.5 bg-[#F6F8FB] px-2.5 py-1.5 text-left text-[12px] ${odprta ? "border-b border-[#DDE3EA]" : ""} rounded-t`}
      >
        {odprta ? <ChevronDown size={13} className="text-[#5B6B7B]" /> : <ChevronRight size={13} className="text-[#5B6B7B]" />}
        <strong className="text-brand-navy">{ime}</strong>
        <span className="rounded-full bg-[#E3E9F0] px-1.5 text-[11px] text-brand-navy">{st}</span>
      </button>
      {odprta && children}
    </section>
  );
}

function Kartica({ id, nazaj }: { id: number; nazaj: () => void }) {
  const [d, setD] = useState<any>(null);
  const [napaka, setNapaka] = useState("");
  const [zaprte, setZaprte] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setD(null);
    setNapaka("");
    fetch(`/api/admin/tecajniki?id=${id}`)
      .then((r) => r.json())
      .then((x) => (x.error ? setNapaka(x.error) : setD(x)))
      .catch(() => setNapaka("Kartice ni bilo mogoče naložiti."));
  }, [id]);

  if (napaka) return <div className="rounded border border-[#DDE3EA] bg-white p-4 text-[12px] text-[#991B1B]">{napaka}</div>;
  if (!d) return <div className="grid place-items-center py-20"><Loader2 className="animate-spin text-brand-orange" size={22} /></div>;

  const p = d.prijava;
  const dodatno: Record<string, any> = p.dodatno && typeof p.dodatno === "object" ? p.dodatno : {};
  const vstopna = Object.entries(dodatno).find(([k]) => k.toLowerCase().includes("vstopna"))?.[1];
  const prisotni = d.prisotnost.filter((x: any) => x.prisoten).length;
  const placano = d.placila.filter((x: any) => x.placano).length;
  const ime = `${p.otrok_ime} ${p.otrok_priimek}`;
  const termin = d.termin
    ? [d.termin.naziv, d.termin.skupina, d.termin.dan, d.termin.ura].filter(Boolean).join(" · ")
    : p.termin || "—";

  const okvirji: [string, React.ReactNode][] = [
    ["Program", p.program_naziv],
    ["Termin / skupina", termin],
    ["Starost", starost(p.otrok_rojstvo)],
    ["Starš", `${p.starsi_ime} ${p.starsi_priimek}`],
    ["Telefon", p.telefon ? <a href={`tel:${p.telefon}`} className="hover:text-[#C2410C]">{p.telefon}</a> : "—"],
    ["E-pošta", p.email ? <a href={`mailto:${p.email}`} className="hover:text-[#C2410C]">{p.email}</a> : "—"],
    ["Vstopna točka", vstopna ? String(vstopna) : "—"],
    ["Plačila", d.placila.length ? `${placano} / ${d.placila.length} plačano` : "Ni vpisov"],
    ["Prisotnost", d.prisotnost.length ? `${prisotni} / ${d.prisotnost.length}` : "Ni vpisov"],
    ["Oddano", datum(p.ustvarjeno)],
  ];

  const podatkiPrijavnice: [string, string][] = [
    ["Datum rojstva", datum(p.otrok_rojstvo)],
    ["Predznanje", p.otrok_znanje || "—"],
    ["Naslov", [p.naslov, p.posta].filter(Boolean).join(", ") || "—"],
    ["Opomba starša", p.opomba || "—"],
    ...Object.entries(dodatno).map(([k, v]) => [k, v === true ? "Da" : v === false ? "Ne" : String(v ?? "—")] as [string, string]),
  ];

  const sekcije = [
    { id: "s-prijave", ime: "Prijave družine", st: d.ostalePrijave.length },
    { id: "s-placila", ime: "Plačila", st: d.placila.length },
    { id: "s-prisotnost", ime: "Prisotnost", st: d.prisotnost.length },
    { id: "s-podatki", ime: "Podatki s prijavnice", st: podatkiPrijavnice.length },
    { id: "s-kontakt", ime: "Kontakt in obveščanje", st: d.kontakt ? 1 : 0 },
  ];
  const odprta = (k: string) => !zaprte[k];
  const preklopi = (k: string) => setZaprte((z) => ({ ...z, [k]: !z[k] }));
  const skoci = (k: string) => {
    setZaprte((z) => ({ ...z, [k]: false }));
    setTimeout(() => document.getElementById(k)?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  const gumb = "inline-flex h-7 items-center gap-1 rounded border border-[#C9D2DD] bg-white px-2.5 text-[12px] text-brand-navy hover:border-brand-navy";

  return (
    <div className="flex flex-col gap-2.5 print:gap-2">
      {/* Glava */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={nazaj} className={`${gumb} lg:hidden`} aria-label="Nazaj na seznam"><ArrowLeft size={13} /> Seznam</button>
        <div className="min-w-0">
          <div className="text-[11px] text-[#5B6B7B]">Tečajniki › {p.program_naziv}</div>
          <h1 className="flex flex-wrap items-center gap-2 text-[17px] font-bold text-brand-navy">{ime} <Znacka status={p.status} /></h1>
        </div>
        <div className="ml-auto flex flex-wrap gap-1 print:hidden">
          <Link href={`/admin/prijave/${p.id}/uredi`} className={gumb}><Pencil size={12} /> Uredi</Link>
          {p.email && <a href={`mailto:${p.email}`} className={gumb}><Mail size={12} /> E-pošta</a>}
          {p.telefon && <a href={`tel:${p.telefon}`} className={gumb}><Phone size={12} /> Pokliči</a>}
          <button onClick={() => window.print()} className={gumb}><Printer size={12} /> Natisni</button>
          <Link href={`/admin/prijave/${p.id}`} className={gumb}><ExternalLink size={12} /> Prijava</Link>
        </div>
      </div>

      {/* Info okvirčki */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-5">
        {okvirji.map(([k, v]) => (
          <div key={k} className="min-w-0 rounded border border-[#DDE3EA] bg-white px-2 py-1.5">
            <div className="text-[10px] uppercase tracking-[0.05em] text-[#5B6B7B]">{k}</div>
            <div className="truncate font-semibold text-brand-navy">{v}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse gap-2.5 xl:flex-row xl:items-start">
        {/* Sekcije */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Sekcija id="s-prijave" ime="Prijave družine" st={d.ostalePrijave.length} odprta={odprta("s-prijave")} preklopi={() => preklopi("s-prijave")}>
            <Tabela
              stolpci={["Oddano", "Otrok", "Program", "Termin", "Status"]}
              prazno="Ni drugih prijav."
              vrstice={d.ostalePrijave.map((x: any) => ({
                celice: [
                  datum(x.ustvarjeno),
                  x.id === p.id ? <strong>{x.otrok_ime} {x.otrok_priimek}</strong> : <Link href={`/admin/tecajniki?id=${x.id}`} className="underline decoration-[#C9D2DD] underline-offset-2 hover:text-[#C2410C]">{x.otrok_ime} {x.otrok_priimek}</Link>,
                  x.program_naziv, x.termin || "—", <Znacka key="z" status={x.status} />,
                ],
                podrobno: [["Oznaka", x.oznaka || "—"], ["Številka prijave", `#${x.id}`]],
              }))}
            />
          </Sekcija>

          <Sekcija id="s-placila" ime="Plačila" st={d.placila.length} odprta={odprta("s-placila")} preklopi={() => preklopi("s-placila")}>
            <Tabela
              stolpci={["Obdobje", "Znesek", "Stanje", "Datum plačila"]}
              prazno="Za tega otroka še ni vpisanih plačil. Vpišeš jih v modulu Plačila."
              vrstice={d.placila.map((x: any) => ({
                celice: [x.mesec, evri(x.znesek), x.placano ? <span className="font-semibold text-[#14532D]">Plačano</span> : <span className="font-semibold text-[#9A3412]">Odprto</span>, datum(x.datum)],
                podrobno: [["Opomba", x.opomba || "—"], ["Zadnja sprememba", datum(x.posodobljeno)]],
              }))}
            />
          </Sekcija>

          <Sekcija id="s-prisotnost" ime="Prisotnost" st={d.prisotnost.length} odprta={odprta("s-prisotnost")} preklopi={() => preklopi("s-prisotnost")}>
            <Tabela
              stolpci={["Datum", "Prisoten", "Učitelji", "Trajanje"]}
              prazno="Prisotnost še ni bila vpisana."
              vrstice={d.prisotnost.map((x: any) => ({
                celice: [datum(x.datum), x.prisoten ? <span className="font-semibold text-[#14532D]">Da</span> : <span className="text-[#9A3412]">Ne</span>, x.ucitelji || "—", `${x.trajanje_min} min`],
                podrobno: [["Opomba", x.opomba || "—"], ["Gost", x.gost ? "Da" : "Ne"]],
              }))}
            />
          </Sekcija>

          <Sekcija id="s-podatki" ime="Podatki s prijavnice" st={podatkiPrijavnice.length} odprta={odprta("s-podatki")} preklopi={() => preklopi("s-podatki")}>
            <dl className="grid gap-x-4 px-3 py-2 sm:grid-cols-2">
              {podatkiPrijavnice.map(([k, v]) => (
                <div key={k} className="flex gap-2 border-b border-[#EEF1F5] py-1">
                  <dt className="w-36 shrink-0 text-[#5B6B7B]">{k}</dt>
                  <dd className="min-w-0 break-words font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Sekcija>

          <Sekcija id="s-kontakt" ime="Kontakt in obveščanje" st={d.kontakt ? 1 : 0} odprta={odprta("s-kontakt")} preklopi={() => preklopi("s-kontakt")}>
            {d.kontakt ? (
              <dl className="grid gap-x-4 px-3 py-2 sm:grid-cols-2">
                {([
                  ["Kontakt", `${d.kontakt.ime || ""} ${d.kontakt.priimek || ""}`.trim() || "—"],
                  ["Prejema e-pošto", d.kontakt.narocen ? "Da" : "Ne (odjavljen)"],
                  ["Oznake (skupine)", d.kontakt.oznake || "—"],
                  ["Vir", d.kontakt.vir || "—"],
                  ["V bazi od", datum(d.kontakt.ustvarjeno)],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex gap-2 border-b border-[#EEF1F5] py-1">
                    <dt className="w-36 shrink-0 text-[#5B6B7B]">{k}</dt>
                    <dd className="min-w-0 break-words font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="px-3 py-3 text-[12px] text-[#5B6B7B]">E-naslov ni v bazi kontaktov.</div>
            )}
          </Sekcija>
        </div>

        {/* Povezano */}
        <aside aria-label="Povezano" className="rounded border border-[#DDE3EA] bg-white xl:sticky xl:top-14 xl:w-[220px] xl:shrink-0 print:hidden">
          <div className="rounded-t border-b border-[#DDE3EA] bg-[#F6F8FB] px-2.5 py-1.5 font-bold text-brand-navy">Povezano</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-1">
            {sekcije.map((s) => (
              <button key={s.id} onClick={() => skoci(s.id)} className="flex items-center justify-between gap-2 border-b border-[#EEF1F5] px-2.5 py-1.5 text-left text-[12px] hover:bg-[#F6F8FB]">
                <span className="truncate">{s.ime}</span>
                <span className="min-w-[22px] rounded-full bg-brand-navy px-1.5 text-center text-[11px] font-semibold text-white">{s.st}</span>
              </button>
            ))}
          </div>
          <div className="px-2.5 py-2 text-[11px] leading-relaxed text-[#5B6B7B]">
            Prijava #{p.id}<br />Oddana {datum(p.ustvarjeno)}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Tecajniki() {
  const router = useRouter();
  const sp = useSearchParams();
  const izbranId = Number(sp.get("id") || 0);
  const [q, setQ] = useState(sp.get("q") || "");
  const [program, setProgram] = useState("");
  const [skupina, setSkupina] = useState("");
  const [status, setStatus] = useState("");
  const [izvazam, setIzvazam] = useState(false);
  const [seznam, setSeznam] = useState<Vrstica[]>([]);
  const [programi, setProgrami] = useState<{ slug: string; naziv: string }[]>([]);
  const [nalagam, setNalagam] = useState(true);
  const [napaka, setNapaka] = useState("");

  useEffect(() => setQ(sp.get("q") || ""), [sp]);

  const nalozi = useCallback(() => {
    setNalagam(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (program) params.set("program", program);
    fetch(`/api/admin/tecajniki?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return setNapaka(d.error);
        setNapaka("");
        setSeznam(d.seznam || []);
        setProgrami(d.programi || []);
      })
      .catch(() => setNapaka("Seznama ni bilo mogoče naložiti."))
      .finally(() => setNalagam(false));
  }, [q, program]);

  useEffect(() => {
    const t = setTimeout(nalozi, 250);
    return () => clearTimeout(t);
  }, [nalozi]);

  const odpri = (id: number) => {
    const params = new URLSearchParams(sp.toString());
    params.set("id", String(id));
    router.push(`/admin/tecajniki?${params}`, { scroll: false });
  };
  const nazaj = () => {
    const params = new URLSearchParams(sp.toString());
    params.delete("id");
    router.push(`/admin/tecajniki?${params}`, { scroll: false });
  };

  const filtri = useMemo(() => [{ slug: "", naziv: "Vsi" }, ...programi], [programi]);

  // Skupine / termini v izbranem programu (iz oznak in terminov na prijavah)
  const skupine = useMemo(
    () => Array.from(new Set(seznam.map(skupinaPrijave).filter(Boolean))).sort((a, b) => a.localeCompare(b, "sl")),
    [seznam]
  );
  useEffect(() => setSkupina(""), [program]);

  const prikazan = useMemo(
    () => seznam.filter((z) => (!skupina || skupinaPrijave(z) === skupina) && (!status || z.status === status)),
    [seznam, skupina, status]
  );

  // Izvoz trenutnega seznama (po filtrih), razvrščen po priimku
  const zaIzvoz = () =>
    [...prikazan].sort((a, b) => `${a.otrok_priimek} ${a.otrok_ime}`.localeCompare(`${b.otrok_priimek} ${b.otrok_ime}`, "sl"));
  const naslovIzvoza = () => {
    const prog = programi.find((x) => x.slug === program)?.naziv;
    return [prog || "Vsi programi", skupina].filter(Boolean).join(" — ");
  };
  const excel = async () => {
    setIzvazam(true);
    try {
      await izvoziExcel(vrsticeZaIzvoz(zaIzvoz()), naslovIzvoza());
    } catch (e: any) {
      alert(e?.message || "Izvoz ni uspel.");
    } finally {
      setIzvazam(false);
    }
  };
  const pdf = () => {
    const ok = izvoziPdf(vrsticeZaIzvoz(zaIzvoz()), `Alpska šola — ${naslovIzvoza()}`, q.trim() ? `Iskanje: ${q.trim()}` : "");
    if (!ok) alert("Brskalnik je blokiral novo okno. Dovoli pojavna okna za to stran in poskusi znova.");
  };
  const aktivenId = izbranId || 0;

  return (
    <div className="flex min-h-[calc(100vh-80px)] gap-3">
      {/* Seznam */}
      <section
        aria-label="Seznam tečajnikov"
        className={`${aktivenId ? "hidden lg:flex" : "flex"} w-full flex-col self-start rounded border border-[#DDE3EA] bg-white lg:sticky lg:top-14 lg:max-h-[calc(100vh-72px)] lg:w-[300px] lg:shrink-0 print:hidden`}
      >
        <div className="flex flex-col gap-1.5 border-b border-[#DDE3EA] p-2">
          <div className="flex items-center justify-between">
            <h1 className="text-[13px] font-bold text-brand-navy">Tečajniki</h1>
            <span className="flex items-center gap-2 text-[11px] text-[#5B6B7B]">
              {nalagam ? "…" : `${prikazan.length} zapisov`}
            </span>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Išči otroka, starša, e-pošto, telefon …"
            aria-label="Išči v seznamu"
            className="h-8 rounded border border-[#C9D2DD] px-2 text-[12.5px] outline-none focus:border-brand-navy"
          />
          <select
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            aria-label="Filter po programu"
            className="h-8 rounded border border-[#C9D2DD] bg-white px-1.5 text-[12px]"
          >
            {filtri.map((f) => (
              <option key={f.slug} value={f.slug}>{f.slug ? f.naziv : "Vsi programi"}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-1.5">
            <select
              value={skupina}
              onChange={(e) => setSkupina(e.target.value)}
              aria-label="Filter po skupini ali terminu"
              className="h-8 min-w-0 rounded border border-[#C9D2DD] bg-white px-1.5 text-[12px]"
            >
              <option value="">Vse skupine / termini</option>
              {skupine.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter po statusu"
              className="h-8 min-w-0 rounded border border-[#C9D2DD] bg-white px-1.5 text-[12px]"
            >
              <option value="">Vsi statusi</option>
              {Object.entries(STATUSI).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#5B6B7B]">Izvozi seznam:</span>
            <button onClick={pdf} disabled={nalagam || prikazan.length === 0} className="inline-flex h-7 items-center gap-1 rounded border border-[#C9D2DD] bg-white px-2 text-[12px] text-brand-navy hover:border-brand-navy disabled:opacity-40">
              <FileText size={12} /> PDF
            </button>
            <button onClick={excel} disabled={izvazam || nalagam || prikazan.length === 0} className="inline-flex h-7 items-center gap-1 rounded border border-[#C9D2DD] bg-white px-2 text-[12px] text-brand-navy hover:border-brand-navy disabled:opacity-40">
              {izvazam ? <Loader2 size={12} className="animate-spin" /> : <FileSpreadsheet size={12} />} Excel
            </button>
            <Link href="/admin/izvoz" className="ml-auto text-[11px] text-[#5B6B7B] underline decoration-[#C9D2DD] underline-offset-2 hover:text-[#C2410C]">Po datumu</Link>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {napaka && <div className="p-3 text-[12px] text-[#991B1B]">{napaka}</div>}
          {!napaka && !nalagam && prikazan.length === 0 && <div className="p-3 text-[12px] text-[#5B6B7B]">Ni zadetkov.</div>}
          {prikazan.map((z) => (
            <button
              key={z.id}
              onClick={() => odpri(z.id)}
              className={`flex w-full flex-col gap-px border-b border-[#EEF1F5] px-2.5 py-1.5 text-left ${
                z.id === aktivenId ? "bg-[#E8EEF5] shadow-[inset_3px_0_0_#FF6B1A]" : "hover:bg-[#F6F8FB]"
              }`}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="truncate font-semibold text-brand-navy">{z.otrok_ime} {z.otrok_priimek}</span>
                <Znacka status={z.status} />
              </span>
              <span className="truncate text-[11.5px] text-[#5B6B7B]">
                {z.program_naziv}{z.oznaka ? ` · ${z.oznaka}` : ""} · {z.starsi_ime} {z.starsi_priimek}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Kartica */}
      <div className={`${aktivenId ? "block" : "hidden lg:block"} min-w-0 flex-1`}>
        {aktivenId ? (
          <Kartica id={aktivenId} nazaj={nazaj} />
        ) : (
          <div className="grid h-60 place-items-center rounded border border-dashed border-[#C9D2DD] text-[12px] text-[#5B6B7B]">
            Izberi tečajnika na seznamu levo.
          </div>
        )}
      </div>
    </div>
  );
}

export default function TecajnikiStran() {
  return (
    <Suspense fallback={null}>
      <Tecajniki />
    </Suspense>
  );
}
