import HeroSection from "@/features/home/components/HeroSection";
import TodaySection from "@/features/home/components/TodaySection";

export default function HomeScreen() {
  return (
    <main className="w-full min-h-screen bg-white">
      <HeroSection />
      <TodaySection />
    </main>
  );
}
