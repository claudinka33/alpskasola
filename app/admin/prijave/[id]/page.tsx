import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { sql } from "@vercel/postgres";
import { pridobiTrenutniAdmin } from "@/lib/auth";
import { ArrowLeft, Phone, Mail, MapPin, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
};

const programLabels: Record<string, string> = {
  "sola-smucanja": "Smučanje",
  "ski-racing-team": "Tekmovalne ekipe",
  "smucarska-akademija": "Akademija",
  "plavalni-tecaj": "Plavanje",
  "sportna-abeceda": "Športna abeceda",
  "sola-rolanja": "Rolanje",
  "praznovanje-rojstnega-dne": "Rojstni dan",
  servis: "Servis",
  "izposoja-opreme": "Izposoja",
};

const statusLabels: Record<string, { label: string; bg: string; text: string }> = {
  nova: { label: "Nova", bg: "bg-amber-100", text: "text-amber-800" },
  potrjeno: { label: "Potrjeno", bg: "bg-blue-100", text: "text-blue-800" },
  placano: { label: "Plačano", bg: "bg-green-100", text: "text-green-800" },
  koncano: { label: "Končano", bg: "bg-slate-100", text: "text-slate-700" },
  preklicano: { label: "Preklicano", bg: "bg-red-100", text: "text-red-800" },
};

export default async function PrijavaPage({ params }: Props) {
  const admin = await pridobiTrenutniAdmin();
  if (!admin) redirect("/admin/login");

  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const result = await sql`SELECT * FROM prijave WHERE id = ${id} LIMIT 1;`;
  const p = result.rows[0];
  if (!p) notFound();

  const st = statusLabels[p.status] || statusLabels.nova;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link
          href="/admin/prijave"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-orange"
        >
          <ArrowLeft size={14} /> Nazaj na prijave
        </Link>
        <Link
          href={`/admin/prijave/${p.id}/uredi`}
          className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-orange-dark transition-colors"
        >
          <Pencil size={14} /> Uredi prijavnico
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center font-bold text-lg shrink-0">
            {p.otrok_ime?.[0]}
            {p.otrok_priimek?.[0]}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-brand-navy">
              {p.otrok_ime} {p.otrok_priimek}
            </h1>
            <p className="text-sm text-slate-500">
              {programLabels[p.program] || p.program} &middot; #{p.id}
            </p>
          </div>
          <span className={`ml-auto text-xs font-bold px-3 py-1.5 rounded-full ${st.bg} ${st.text}`}>
            {st.label.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 p-6 mb-4">
        <h2 className="text-sm font-bold text-brand-navy mb-3">Otrok</h2>
        <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs text-slate-500 block">Ime in priimek</span>
            <strong className="text-brand-navy">
              {p.otrok_ime} {p.otrok_priimek}
            </strong>
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Rojstvo</span>
            <strong className="text-brand-navy">
              {p.otrok_rojstvo
                ? new Date(p.otrok_rojstvo).toLocaleDateString("sl-SI")
                : "-"}
            </strong>
          </div>
          {p.otrok_znanje && (
            <div>
              <span className="text-xs text-slate-500 block">Znanje</span>
              <strong className="text-brand-navy">{p.otrok_znanje}</strong>
            </div>
          )}
          {p.termin && (
            <div>
              <span className="text-xs text-slate-500 block">Termin</span>
              <strong className="text-brand-navy">{p.termin}</strong>
            </div>
          )}
          {p.cena != null && (
            <div>
              <span className="text-xs text-slate-500 block">Cena</span>
              <strong className="text-brand-navy">{p.cena} EUR</strong>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 p-6 mb-4">
        <h2 className="text-sm font-bold text-brand-navy mb-3">Starš</h2>
        <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
          <strong className="text-brand-navy block">
            {p.starsi_ime} {p.starsi_priimek}
          </strong>
          {p.telefon && (
            <a
              href={`tel:${p.telefon}`}
              className="flex items-center gap-2 text-brand-orange hover:underline"
            >
              <Phone size={14} /> {p.telefon}
            </a>
          )}
          {p.email && (
            <a
              href={`mailto:${p.email}`}
              className="flex items-center gap-2 text-brand-orange hover:underline"
            >
              <Mail size={14} /> {p.email}
            </a>
          )}
          {(p.naslov || p.posta) && (
            <div className="flex items-center gap-2 text-slate-500 pt-1">
              <MapPin size={14} /> {p.naslov} {p.posta}
            </div>
          )}
        </div>
      </div>

      {p.opomba && (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-6 mb-4">
          <h2 className="text-sm font-bold text-brand-navy mb-3">Opomba</h2>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-line">
            {p.opomba}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 px-1">
        Prijava ustvarjena:{" "}
        {p.ustvarjeno ? new Date(p.ustvarjeno).toLocaleString("sl-SI") : "-"}
      </p>
    </div>
  );
}
