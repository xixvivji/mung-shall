import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";

import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";

import { IntroductionSection } from "./components/sections/IntroductionSection";
import { AdoptionSection } from "./components/sections/AdoptionSection";
import { DonationSection } from "./components/sections/DonationSection";
import { FAQSection } from "./components/sections/FAQSection";
import { BoardSection } from "./components/sections/BoardSection";

function Layout() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* ✅ 홈: Hero + Introduction 스크롤 배치 */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />

          {/* 탭(페이지) */}
          <Route path="/introduction" element={<IntroductionSection />} />
          <Route path="/adoption" element={<AdoptionSection />} />
          <Route path="/donation" element={<DonationSection />} />
          <Route path="/faq" element={<FAQSection />} />
          <Route path="/board" element={<BoardSection />} />

          {/* <Route path="/login" element={<LoginSection />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
