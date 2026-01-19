import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";

import { SignUpFormSection } from "../components/sections/SignUpFormSection";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-surface text-ink">
      <Header />
      <main>
        <SignUpFormSection />
      </main>
      <Footer />
    </div>
  );
}
