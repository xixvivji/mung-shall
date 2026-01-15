import { Header } from './components/Header';
import { LoginHero } from './components/LoginHero';
import { LoginForm } from './components/LoginForm';
import { QuickAccess } from './components/QuickAccess';
import { Footer } from './components/Footer';

export default function Login() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <LoginHero />
        <LoginForm />
        <QuickAccess />
      </main>
      <Footer />
    </div>
  );
}
