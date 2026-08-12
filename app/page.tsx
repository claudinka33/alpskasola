import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBand from "@/components/StatsBand";
import Programs from "@/components/Programs";
import VpisKoraki from "@/components/VpisKoraki";
import About from "@/components/About";
import FotoPas from "@/components/FotoPas";
import Utrinki from "@/components/Utrinki";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <StatsBand />
      <Programs />
      <VpisKoraki />
      <About />
      <FotoPas />
      <Utrinki />
      <CtaBand />
      <Footer />
    </main>
  );
}
