import { Outlet } from "react-router-dom";
import Footer from "@/shared/layout/Footer";
import Header from "@/shared/layout/Header";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-white text-[#111]">
      <Header />
      <main className="relative pt-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
