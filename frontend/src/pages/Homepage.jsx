import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Footer from "../components/Footer";
import LogoSliderSection from "../components/LogoSliderSection";


const Homepage = () => {
  return (
    // full‑width wrapper now allows vertical overflow and only hides horizontal scroll
    <div className="w-full overflow-x-hidden overflow-y-auto">
      <Hero />
      <LogoSliderSection />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Homepage;
