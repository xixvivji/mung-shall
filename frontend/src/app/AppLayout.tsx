import { Outlet, useLocation } from "react-router-dom";
import Footer from "@/shared/layout/Footer";
import Header from "@/shared/layout/Header";
import Layout from "@/shared/layout/Layout";

export default function AppLayout() {
  const location = useLocation();
  const isFullBleedPage =
    location.pathname === "/" || location.pathname.startsWith("/boards");

  const pageContent = (
    <main className="relative w-full">
      <Outlet />
    </main>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FB] text-[#111827]">
      <Header />

      {isFullBleedPage ? pageContent : <Layout>{pageContent}</Layout>}

      <Footer />
    </div>
  );
}
