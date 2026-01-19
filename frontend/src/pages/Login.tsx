import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { LoginSection } from "../components/sections/LoginSection";

export default function Login() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <Header />
      <main>
        <LoginSection />
      </main>
      <Footer />
    </div>
  );
}
