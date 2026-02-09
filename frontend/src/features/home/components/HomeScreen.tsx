import HeroSection from "@/features/home/components/HeroSection";
import TodaySection from "@/features/home/components/TodaySection";
import HomeIntroSections from "@/features/home/components/HomeIntroSections";

export default function HomeScreen() {
  return (
    <main className="w-full min-h-screen bg-white">
      <HeroSection />
      <TodaySection />
      <HomeIntroSections />
    </main>
  );
}
