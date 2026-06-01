"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, AlertCircle, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [geslo, setGeslo] = useState("");
  const [posiljam, setPosiljam] = useState(false);
  const [napaka, setNapaka] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosiljam(true);
    setNapaka("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, geslo }),
      });
      const data = await res.json();

      if (!res.ok) {
        setNapaka(data.error || "Napaka pri prijavi");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setNapaka("Napaka pri povezavi");
    } finally {
      setPosiljam(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center mountain-bg p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src="https://assets.cdn.filesafe.space/x59KaDfsCMuhMlks5lOI/media/6a1438ede05851175c7a0326.png"
            alt="Alpska šola"
            width={64}
            height={64}
            className="mx-auto h-16 w-auto"
          />
          <h1 className="text-2xl font-extrabold text-brand-navy mt-4">
            CRM Alpska šola
          </h1>
          <p className="text-sm text-slate-600 mt-1">Prijava v admin sistem</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl border border-slate-200/70 p-8 shadow-xl shadow-brand-navy/5"
        >
          <div className="mb-5">
            <label className="block text-sm font-semibold text-brand-navy mb-1.5">
              E-pošta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm"
              placeholder="info@alpskasola.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-brand-navy mb-1.5">
              Geslo
            </label>
            <input
              type="password"
              value={geslo}
              onChange={(e) => setGeslo(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none text-sm"
            />
          </div>

          {napaka && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
              <AlertCircle size={16} />
              <span>{napaka}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={posiljam}
            className="w-full bg-brand-orange text-white py-3.5 rounded-lg font-bold hover:bg-brand-orange-dark transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {posiljam ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Prijavljam...
              </>
            ) : (
              <>
                <Lock size={16} /> Prijava
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Pozabljeno geslo? Pokliči 064 230 888
        </p>
      </div>
    </main>
  );
}
