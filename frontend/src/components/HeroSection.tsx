import { Button } from './Button';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--surface))] to-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 bg-[hsl(var(--primary))]/10 rounded-full">
              <span className="text-[hsl(var(--primary))]">🐾 새로운 가족을 만나보세요</span>
            </div>
            
            <h1 className="text-[hsl(var(--secondary))]">
              모든 강아지는<br />
              <span className="text-[hsl(var(--primary))]">영원한 집</span>을<br />
              찾을 자격이 있습니다
            </h1>
            
            <p className="text-xl text-[hsl(var(--text-secondary))] max-w-xl">
              유기견에게 두 번째 기회를, 당신에게는 평생의 친구를 선물하세요.
              지금 입양을 통해 한 생명을 구하고 행복을 찾으세요.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="lg" onClick={() => {
                document.getElementById('adoption')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                입양 가능한 강아지 보기
              </Button>
              <Button variant="outline" size="lg" onClick={() => {
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                더 알아보기
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold text-[hsl(var(--primary))]">2,847+</div>
                <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">성공적인 입양</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[hsl(var(--primary))]">156</div>
                <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">입양 대기 중</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[hsl(var(--primary))]">98%</div>
                <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">행복한 가족</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1720705313994-12cd7930da3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZyUyMGFkb3B0aW9ufGVufDF8fHx8MTc2ODMwNjg2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="행복한 강아지"
                className="w-full h-[600px] object-cover"
              />
            </div>
            
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[hsl(var(--accent))]/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">❤️</span>
                </div>
                <div>
                  <div className="font-semibold text-[hsl(var(--secondary))]">오늘의 성공 입양</div>
                  <div className="text-sm text-[hsl(var(--text-secondary))]">3마리의 강아지가 새 가족을 만났어요!</div>
                </div>
              </div>
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
