import { HeroSection } from "../components/sections/HeroSection";
import { IntroductionSection } from "../components/sections/IntroductionSection";

export default function Home() {
  return (
    <main className="w-full">
      <HeroSection />
      <IntroductionSection />
    </main>
  );
}
