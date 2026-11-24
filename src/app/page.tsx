import Header from "@/components/Header";
import PhoneStageLoader from "@/components/PhoneStageLoader";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import Solution from "@/components/sections/Solution";
import Services from "@/components/sections/Services";
import Brands from "@/components/sections/Brands";
import Reviews from "@/components/sections/Reviews";
import Cta from "@/components/sections/Cta";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import HeroBackground from "@/components/HeroBackground";
import GradualBlur from "@/components/reactbits/GradualBlur";

export default function Home() {
  return (
    <>
      <a
        href="#how"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-deep focus:px-4 focus:py-2 focus:text-frost-50"
      >
        Skip to content
      </a>
      <SmoothScroll />
      <HeroBackground />
      <PhoneStageLoader />
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Services />
        <Brands />
        <Reviews />
        <Cta />
      </main>
      <Footer />
      {/* soft blur at the top and bottom edges of the viewport */}
      <GradualBlur target="page" position="top" height="5rem" strength={2} zIndex={30} />
      <GradualBlur target="page" position="bottom" height="4rem" strength={1.6} zIndex={30} />
    </>
  );
}
