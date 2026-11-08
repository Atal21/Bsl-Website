import Categories from "@/components/home/Categories";
import CTASection from "@/components/CTASection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Hero from "@/components/home/Hero";
import IndustriesStrip from "@/components/home/IndustriesStrip";
import Marquee from "@/components/home/Marquee";
import Process from "@/components/home/Process";
import Stats from "@/components/home/Stats";
import VisionMission from "@/components/home/VisionMission";
import WhyUs from "@/components/home/WhyUs";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Stats />
      <Categories />
      <FeaturedProducts />
      <WhyUs />
      <IndustriesStrip />
      <VisionMission />
      <Process />
      <CTASection />
    </>
  );
}
