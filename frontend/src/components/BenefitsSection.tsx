import { Heart, Bell, FileText } from 'lucide-react';

export function BenefitsSection() {
  const benefits = [
    {
      icon: <Heart size={32} />,
      title: '관심 강아지 저장',
      description: '마음에 드는 강아지를 저장하고 나중에 다시 확인할 수 있어요',
      badge: '💖 찜하기',
    },
    {
      icon: <Bell size={32} />,
      title: '입양 공고 알림 받기',
      description: '새로운 입양 공고와 관심 강아지의 소식을 실시간으로 받아보세요',
      badge: '🔔 알림',
    },
    {
      icon: <FileText size={32} />,
      title: '후원 내역 및 영수증 관리',
      description: '후원 내역을 한눈에 확인하고 기부금 영수증을 쉽게 발급받으세요',
      badge: '📊 관리',
    },
  ];

  return (
    <section className="py-24 bg-[hsl(var(--surface))]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[hsl(var(--primary))]/10 rounded-full mb-4">
            <span className="text-[hsl(var(--primary))]">Benefits</span>
          </div>
          <h2 className="text-[hsl(var(--secondary))] mb-4">가입하면 가능한 것</h2>
          <p className="text-lg text-[hsl(var(--text-secondary))]">
            멍즈 회원만의 특별한 혜택을 누려보세요
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-[hsl(var(--border))] group relative overflow-hidden"
            >
              {/* Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-[hsl(var(--accent))]/20 rounded-full text-sm">
                {benefit.badge}
              </div>

              {/* Icon */}
              <div className="w-16 h-16 bg-[hsl(var(--primary))]/10 rounded-2xl flex items-center justify-center text-[hsl(var(--primary))] mb-6 group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>

              {/* Content */}
              <h3 className="text-[hsl(var(--secondary))] mb-3">{benefit.title}</h3>
              <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                {benefit.description}
              </p>

              {/* Decorative Element */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[hsl(var(--primary))]/5 rounded-full blur-2xl group-hover:bg-[hsl(var(--primary))]/10 transition-colors duration-300"></div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 px-8 py-6 bg-gradient-to-r from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10 rounded-2xl">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎁</span>
              <span className="text-[hsl(var(--text-secondary))]">가입 축하 포인트 100P</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-[hsl(var(--border))]"></div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <span className="text-[hsl(var(--text-secondary))]">첫 후원 시 추가 50P</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-[hsl(var(--border))]"></div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span className="text-[hsl(var(--text-secondary))]">입양 성공 시 히어로 배지</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
