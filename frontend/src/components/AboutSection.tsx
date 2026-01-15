import { useState } from 'react';

export function AboutSection() {
  const [activeTab, setActiveTab] = useState<'greeting' | 'branding' | 'organization'>('greeting');

  const tabs = [
    { id: 'greeting' as const, label: '인사말' },
    { id: 'branding' as const, label: '브랜딩' },
    { id: 'organization' as const, label: '조직도' },
  ];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[hsl(var(--primary))]/10 rounded-full mb-4">
            <span className="text-[hsl(var(--primary))]">About Us</span>
          </div>
          <h2 className="text-[hsl(var(--secondary))] mb-4">포에버홈 소개</h2>
          <p className="text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto">
            유기견에게 따뜻한 보금자리를, 사람에게는 진정한 반려의 의미를 전합니다
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-3 rounded-full transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[hsl(var(--primary))] text-white shadow-lg'
                  : 'bg-[hsl(var(--surface))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--border))]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-[hsl(var(--surface))] rounded-3xl p-8 lg:p-12">
          {activeTab === 'greeting' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <h3 className="text-[hsl(var(--secondary))]">안녕하세요, 포에버홈입니다</h3>
              <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                포에버홈은 2015년부터 유기견 입양과 보호 활동을 이어온 비영리 단체입니다.
                매년 수많은 강아지들이 버려지고 있는 현실 속에서, 우리는 단 한 마리의 생명도 포기하지 않습니다.
              </p>
              <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                우리의 목표는 단순히 유기견을 입양시키는 것을 넘어, 반려동물과 사람이 서로 존중하며 행복하게 공존하는 
                문화를 만드는 것입니다. 지금까지 2,800여 마리 이상의 강아지가 새로운 가족을 만났고, 
                그들의 행복한 이야기가 우리의 가장 큰 보람입니다.
              </p>
              <p className="text-[hsl(var(--text-secondary))] leading-relaxed">
                입양을 고민하시는 분들께, 유기견 입양은 한 생명을 구하는 것 이상의 의미를 갖습니다.
                여러분의 작은 결정이 만들어낼 큰 변화에 함께해 주세요.
              </p>
              <div className="pt-6">
                <p className="text-[hsl(var(--secondary))]">포에버홈 대표 김민지 드림</p>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <h3 className="text-[hsl(var(--secondary))]">우리의 브랜드 가치</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-[hsl(var(--primary))]/10 rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">💙</span>
                  </div>
                  <h4 className="text-[hsl(var(--secondary))]">따뜻한 공감</h4>
                  <p className="text-[hsl(var(--text-secondary))]">
                    유기견의 아픔을 이해하고, 그들에게 필요한 사랑과 보살핌을 제공합니다.
                    모든 생명은 존중받을 가치가 있다는 믿음으로 활동합니다.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="w-16 h-16 bg-[hsl(var(--accent))]/20 rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">🌟</span>
                  </div>
                  <h4 className="text-[hsl(var(--secondary))]">투명한 운영</h4>
                  <p className="text-[hsl(var(--text-secondary))]">
                    모든 후원금과 입양 절차는 투명하게 공개됩니다.
                    신뢰를 바탕으로 더 많은 생명을 구하는 것이 우리의 약속입니다.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="w-16 h-16 bg-[hsl(var(--primary))]/10 rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">🤝</span>
                  </div>
                  <h4 className="text-[hsl(var(--secondary))]">평생 책임</h4>
                  <p className="text-[hsl(var(--text-secondary))]">
                    입양 후에도 지속적인 관리와 상담을 제공합니다.
                    반려견과 보호자 모두가 행복할 수 있도록 끝까지 함께합니다.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="w-16 h-16 bg-[hsl(var(--accent))]/20 rounded-2xl flex items-center justify-center">
                    <span className="text-3xl">🌱</span>
                  </div>
                  <h4 className="text-[hsl(var(--secondary))]">지속 가능한 변화</h4>
                  <p className="text-[hsl(var(--text-secondary))]">
                    입양 문화 확산을 통해 유기견 문제의 근본적인 해결을 추구합니다.
                    교육과 캠페인으로 사회 전반의 인식 개선을 이끕니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'organization' && (
            <div className="space-y-8 max-w-5xl mx-auto">
              <h3 className="text-[hsl(var(--secondary))] text-center">조직 구조</h3>
              
              <div className="space-y-6">
                {/* Level 1 */}
                <div className="flex justify-center">
                  <div className="bg-white p-6 rounded-2xl shadow-md text-center min-w-[200px]">
                    <div className="font-semibold text-[hsl(var(--secondary))]">대표이사</div>
                    <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">김민지</div>
                  </div>
                </div>

                {/* Level 2 */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-md text-center">
                    <div className="font-semibold text-[hsl(var(--secondary))]">입양센터</div>
                    <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">팀장 이서연</div>
                    <div className="text-xs text-[hsl(var(--text-secondary))] mt-3 space-y-1">
                      <div>• 입양 상담</div>
                      <div>• 매칭 관리</div>
                      <div>• 사후 관리</div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-md text-center">
                    <div className="font-semibold text-[hsl(var(--secondary))]">보호센터</div>
                    <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">팀장 박준호</div>
                    <div className="text-xs text-[hsl(var(--text-secondary))] mt-3 space-y-1">
                      <div>• 구조 활동</div>
                      <div>• 건강 관리</div>
                      <div>• 임시 보호</div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-md text-center">
                    <div className="font-semibold text-[hsl(var(--secondary))]">운영지원팀</div>
                    <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">팀장 최지우</div>
                    <div className="text-xs text-[hsl(var(--text-secondary))] mt-3 space-y-1">
                      <div>• 후원 관리</div>
                      <div>• 홍보 마케팅</div>
                      <div>• 재무 회계</div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-gradient-to-r from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10 p-8 rounded-2xl mt-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-[hsl(var(--primary))]">25명</div>
                      <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">정규 직원</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[hsl(var(--primary))]">120명</div>
                      <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">자원봉사자</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[hsl(var(--primary))]">8개</div>
                      <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">협력 병원</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[hsl(var(--primary))]">3개</div>
                      <div className="text-sm text-[hsl(var(--text-secondary))] mt-1">보호 시설</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
