import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alpska šola Rogla — Migaj z nami, zmaguj zase",
  description: "Največja šola smučanja v Sloveniji. 15+ let izkušenj, 15.000+ zadovoljnih otrok.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sl" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
