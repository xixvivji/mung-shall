import { Heart, Bell, Gift, TrendingUp } from 'lucide-react';

export function QuickAccess() {
  const features = [
    {
      icon: <Heart size={28} />,
      title: '관심 강아지',
      description: '저장한 강아지 확인하기',
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: <Bell size={28} />,
      title: '알림',
      description: '새로운 공고 알림',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Gift size={28} />,
      title: '후원 내역',
      description: '나의 후원 확인하기',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: <TrendingUp size={28} />,
      title: '활동 내역',
      description: '포인트 & 레벨 관리',
      color: 'from-orange-500 to-amber-500',
    },
  ];

  return (
    <section className="py-20 bg-[hsl(var(--surface))]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h3 className="text-[hsl(var(--secondary))] mb-3">로그인하면 바로 이용 가능해요</h3>
          <p className="text-[hsl(var(--text-secondary))]">
            나만의 입양 여정을 관리하세요
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h4 className="text-[hsl(var(--secondary))] mb-2">{feature.title}</h4>
              <p className="text-sm text-[hsl(var(--text-secondary))]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
