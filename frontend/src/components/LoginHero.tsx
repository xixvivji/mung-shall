import { Button } from './Button';

export function LoginHero() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-[hsl(var(--surface))] to-white pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))]/10 rounded-full">
                <span className="text-2xl">👋</span>
                <span className="text-[hsl(var(--secondary))] font-medium">다시 만나서 반가워요</span>
              </div>
              
              <h1 className="text-[hsl(var(--secondary))]">
                <span className="text-[hsl(var(--primary))]">멍즈</span>에<br />
                다시 오신 것을 환영합니다
              </h1>
              
              <p className="text-xl text-[hsl(var(--text-secondary))] max-w-xl mx-auto">
                저장한 관심 강아지를 확인하고,<br />
                따뜻한 입양 여정을 이어가세요.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="outline" size="lg" onClick={() => {
                window.location.href = '/signup';
              }}>
                회원가입하기
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
