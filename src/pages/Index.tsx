import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Platforms from "@/components/Platforms";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Platforms />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
