import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StatsBand from "@/components/StatsBand";
import Programs from "@/components/Programs";
import VpisKoraki from "@/components/VpisKoraki";
import About from "@/components/About";
import FotoPas from "@/components/FotoPas";
import PredstavitveniVideo from "@/components/PredstavitveniVideo";
import FacebookPas from "@/components/FacebookPas";
import InstagramObjave from "@/components/InstagramObjave";
import CtaBand from "@/components/CtaBand";
import Footer from "@/components/Footer";

// Instagram objave se osvežijo najkasneje vsakih 30 min
export const revalidate = 1800;

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <StatsBand />
      <PredstavitveniVideo />
      <Programs />
      <VpisKoraki />
      <About />
      <FotoPas />
      <InstagramObjave />
      <CtaBand />
      <FacebookPas />
      <Footer />
    </main>
  );
}
