import { Button } from './Button';

export function SignUpHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-[hsl(var(--surface))] to-white pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <div className="max-w-2xl mx-auto text-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--accent))]/20 rounded-full">
                <span className="text-2xl">✨</span>
                <span className="text-[hsl(var(--secondary))] font-medium">새로운 시작</span>
              </div>
              
              <h1 className="text-[hsl(var(--secondary))]">
                입양을 더 쉽고<br />
                <span className="text-[hsl(var(--primary))]">따뜻하게.</span>
              </h1>
              
              <p className="text-xl text-[hsl(var(--text-secondary))] max-w-xl mx-auto">
                관심 강아지를 저장하고, 입양 공고 알림을 받아보세요.<br />
                지금 회원가입하고 한 생명을 구하는 여정을 시작하세요.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="primary" size="lg" onClick={() => {
                document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                이메일로 회원가입
              </Button>
              <Button variant="outline" size="lg" onClick={() => {
                window.location.href = '/login';
              }}>
                로그인
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-32 h-32 bg-[hsl(var(--accent))]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl"></div>
    </section>
  );
}
