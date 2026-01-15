import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { AdoptionSection } from "./components/AdoptionSection";
import { DonationSection } from "./components/DonationSection";
import { FAQSection } from "./components/FAQSection";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <HeroSection />
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
              <AboutSection />
            </Layout>
          }
        />
        <Route
          path="/adoption"
          element={
            <Layout>
              <AdoptionSection />
            </Layout>
          }
        />
        <Route
          path="/donation"
          element={
            <Layout>
              <DonationSection />
            </Layout>
          }
        />
        <Route
          path="/faq"
          element={
            <Layout>
              <FAQSection />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
