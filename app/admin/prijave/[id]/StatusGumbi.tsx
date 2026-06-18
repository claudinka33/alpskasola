"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const statusi = [
  { value: "nova", label: "Nova", bg: "bg-amber-100", text: "text-amber-800" },
  { value: "potrjeno", label: "Potrjeno", bg: "bg-blue-100", text: "text-blue-800" },
  { value: "placano", label: "Plačano", bg: "bg-green-100", text: "text-green-800" },
  { value: "koncano", label: "Končano", bg: "bg-slate-100", text: "text-slate-700" },
  { value: "preklicano", label: "Preklicano", bg: "bg-red-100", text: "text-red-800" },
];

export default function StatusGumbi({ id, zacetni }: { id: number; zacetni: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(zacetni);
  const [saving, setSaving] = useState(false);

  const spremeni = async (nov: string) => {
    setSaving(true);
    setStatus(nov);
    try {
      await fetch("/api/prijave/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nov }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {statusi.map((s) => (
        <button
          key={s.value}
          onClick={() => spremeni(s.value)}
          disabled={saving}
          className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all disabled:opacity-50 ${
            status === s.value
              ? `${s.bg} ${s.text} ring-2 ring-offset-1 ring-current`
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {s.label.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
