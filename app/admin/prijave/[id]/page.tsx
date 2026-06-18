import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { sql } from "@vercel/postgres";
import { pridobiTrenutniAdmin } from "@/lib/auth";
import { ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import StatusGumbi from "./StatusGumbi";

export const dynamic = "force-dynamic";

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

export default async function PrijavaPage({ params }: { params: { id: string } }) {
  const admin = await pridobiTrenutniAdmin();
  if (!admin) redirect("/admin/login");

  const id = Number(params.id);
  if (!Number.isFinite(id)) notFound();

  const result = await sql`SELECT * FROM prijave WHERE id = ${id} LIMIT 1;`;
  const p = result.rows[0];
  if (!p) notFound();

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/prijave"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-brand-orange mb-4"
      >
        <ArrowLeft size={14} /> Nazaj na prijave
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center font-bold text-lg shrink-0">
            {p.otrok_ime?.[0]}
            {p.otrok_priimek?.[0]}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-brand-navy">
              {p.otrok_ime} {p.otrok_priimek}
            </h1>
            <p className="text-sm text-slate-500">
              {programLabels[p.program] || p.program} · #{p.id}
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-6 mb-4">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
          Status
        </label>
        <StatusGumbi id={p.id} zacetni={p.status} />
      </div>

      {/* Otrok */}
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
                : "—"}
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
              <strong className="text-brand-navy">{p.cena} €</strong>
            </div>
          )}
        </div>
      </div>

      {/* Starš */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-6 mb-4">
        <h2 className="text-sm font-bold text-brand-navy mb-3">Starš</h2>
        <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
          <strong className="text-brand-navy block">
            {p.starsi_ime} {p.starsi_priimek}
          </strong>
          {p.telefon && (
            
              href={`tel:${p.telefon}`}
              className="flex items-center gap-2 text-brand-orange hover:underline"
            >
              <Phone size={14} /> {p.telefon}
            </a>
          )}
          {p.email && (
            
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

      {/* Opomba */}
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
        {p.ustvarjeno
          ? new Date(p.ustvarjeno).toLocaleString("sl-SI")
          : "—"}
      </p>
    </div>
  );
}
