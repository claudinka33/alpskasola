import { pridobiTrenutniAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { sql } from "@vercel/postgres";

export default async function AdminiPage() {
  const admin = await pridobiTrenutniAdmin();
  if (!admin) redirect("/admin/login");

  const result = await sql`SELECT id, email, ime, vloga, ustvarjeno FROM admini ORDER BY id;`;
  const admini = result.rows;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-brand-navy mb-1">Uporabniki</h1>
        <p className="text-sm text-slate-600">Admini z dostopom do CRM-ja</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200/70">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase">Ime</th>
              <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase">Vloga</th>
              <th className="text-left px-4 py-3 font-semibold text-brand-navy text-xs uppercase">Ustvarjeno</th>
            </tr>
          </thead>
          <tbody>
            {admini.map((a: any) => (
              <tr key={a.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-semibold text-brand-navy">{a.ime}</td>
                <td className="px-4 py-3 text-slate-600">{a.email}</td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800">
                    {(a.vloga || "admin").toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {new Date(a.ustvarjeno).toLocaleDateString("sl-SI")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        💡 Za dodajanje novega admina nas kontaktirajte. (Funkcija prihaja v naslednji posodobitvi.)
      </div>
    </div>
  );
}
