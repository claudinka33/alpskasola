import Link from "next/link";
import {
  Phone,
  Clock,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-brand-navy-dark text-slate-400 pt-14 pb-6">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="text-brand-orange text-sm font-bold tracking-wider mb-3">
              ALPSKA ŠOLA ROGLA
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Največja šola smučanja v Sloveniji. Migaj z nami, zmaguj zase.
            </p>
            <div className="flex gap-2">
              <a
                href="https://www.facebook.com/alpskasola/?locale=sl_SI"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-brand-orange flex items-center justify-center text-white transition-colors"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://www.instagram.com/alpskasola/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-brand-orange flex items-center justify-center text-white transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://www.youtube.com/@alpskasola4739"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-brand-orange flex items-center justify-center text-white transition-colors"
              >
                <Youtube size={16} />
              </a>
              <a
                href="https://www.tiktok.com/@alpskasola.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-brand-orange flex items-center justify-center text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                  <path d="M16.5 3c.36 2.27 1.86 3.9 4.05 4.18v2.79c-1.27.12-2.46-.27-3.86-1.02v6.2c0 3.6-2.6 6.05-5.97 6.05-3.19 0-5.62-2.43-5.62-5.62 0-3.32 2.74-5.71 6.18-5.32v2.92c-.42-.13-.89-.2-1.32-.2-1.5 0-2.62 1.13-2.62 2.6 0 1.56 1.13 2.66 2.71 2.66 1.66 0 2.81-1.2 2.81-2.99V3h3.64z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Programi</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/sola-smucanja"
                  className="hover:text-brand-orange transition-colors"
                >
                  Tečaji smučanja
                </Link>
              </li>
              <li>
                <Link
                  href="/smucarska-akademija"
                  className="hover:text-brand-orange transition-colors"
                >
                  Akademija
                </Link>
              </li>
              <li>
                <Link
                  href="/ski-racing-team"
                  className="hover:text-brand-orange transition-colors"
                >
                  Tekmovalne ekipe
                </Link>
              </li>
              <li>
                <Link
                  href="/plavalni-tecaj"
                  className="hover:text-brand-orange transition-colors"
                >
                  Plavanje
                </Link>
              </li>
              <li>
                <Link
                  href="/sportna-abeceda"
                  className="hover:text-brand-orange transition-colors"
                >
                  Športna abeceda
                </Link>
              </li>
              <li>
                <Link
                  href="/sola-rolanja"
                  className="hover:text-brand-orange transition-colors"
                >
                  Rolanje
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Kontakt</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Phone size={14} /> 064 230 888
              </li>
              <li className="flex items-center gap-2">
                <Clock size={14} /> Pon–Pet, 16h–20h
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} /> info@alpskasola.com
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0" /> Tepanje 60, 3210
                Slovenske Konjice
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">
              Hitre povezave
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/prijava"
                  className="hover:text-brand-orange transition-colors"
                >
                  Prijavnice
                </Link>
              </li>
              <li>
                <a
                  href="https://app.vibeit.co/sl/sportno-drustvo-alpska-sola"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-orange transition-colors"
                >
                  Spletna trgovina
                </a>
              </li>
              <li>
                <Link
                  href="/o-nas"
                  className="hover:text-brand-orange transition-colors"
                >
                  O nas
                </Link>
              </li>
              <li>
                <Link
                  href="/splosni-pogoji"
                  className="hover:text-brand-orange transition-colors"
                >
                  Splošni pogoji
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="hover:text-brand-orange transition-colors"
                >
                  CMS (za zaposlene)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] text-slate-500">
          <span>
            © {new Date().getFullYear()} Športno društvo Alpska šola. Vse pravice
            pridržane.
          </span>
          <Link
            href="/splosni-pogoji"
            className="hover:text-brand-orange transition-colors"
          >
            Splošni pogoji · Zasebnost · Piškotki
          </Link>
        </div>
      </div>
    </footer>
  );
}
