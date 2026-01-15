import { Header } from './components/Header';
import { SignUpHero } from './components/SignUpHero';
import { SignUpForm } from './components/SignUpForm';
import { BenefitsSection } from './components/BenefitsSection';
import { SignUpFAQ } from './components/SignUpFAQ';
import { Footer } from './components/Footer';

export default function SignUp() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <SignUpHero />
        <SignUpForm />
        <BenefitsSection />
        <SignUpFAQ />
      </main>
      <Footer />
    </div>
  );
}
