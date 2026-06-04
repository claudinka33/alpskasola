import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBand from "@/components/StatsBand";
import Programs from "@/components/Programs";
import Utrinki from "@/components/Utrinki";
import About from "@/components/About";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <StatsBand />
      <Programs />
      <Utrinki />
      <About />
      <CtaBand />
      <Footer />
    </main>
  );
}
