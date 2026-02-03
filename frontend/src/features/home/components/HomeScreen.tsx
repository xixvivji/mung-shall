import HeroSection from "@/features/home/components/HeroSection"
import TodaySection from "@/features/home/components/TodaySection";

export default function HomeScreen() {
  return (
    <main className="bg-white w-full min-h-screen">
      <HeroSection />
      <TodaySection />
    </main>
  );
}
