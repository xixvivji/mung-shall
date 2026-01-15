import { DogCard } from './DogCard';
import { Button } from './Button';

export function AdoptionSection() {
  const dogs = [
    {
      id: 1,
      name: '보리',
      breed: '골든 리트리버',
      age: '2살',
      gender: '남아',
      location: '서울',
      image: 'https://images.unsplash.com/photo-1615233500064-caa995e2f9dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjByZXRyaWV2ZXIlMjBwdXBweXxlbnwxfHx8fDE3NjgyODU2MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      description: '활발하고 사람을 좋아하는 보리에요. 산책과 놀이를 좋아하며 아이들과도 잘 지냅니다.',
    },
    {
      id: 2,
      name: '구름',
      breed: '말티즈 믹스',
      age: '3살',
      gender: '여아',
      location: '경기',
      image: 'https://images.unsplash.com/photo-1629098932831-6a58b4307b2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMHdoaXRlJTIwZG9nfGVufDF8fHx8MTc2ODM1NzY1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      description: '순하고 조용한 성격의 구름이에요. 실내 생활에 적응이 잘 되어 있고 집순이 스타일입니다.',
    },
    {
      id: 3,
      name: '초코',
      breed: '믹스견',
      age: '1살',
      gender: '남아',
      location: '부산',
      image: 'https://images.unsplash.com/photo-1619876451741-407e8350442e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm93biUyMG1peGVkJTIwYnJlZWQlMjBkb2d8ZW58MXx8fHwxNzY4MzU3NjU2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      description: '호기심 많고 영리한 초코에요. 훈련을 빠르게 배우며 활동적인 가족과 잘 맞을 것 같아요.',
    },
    {
      id: 4,
      name: '까망',
      breed: '래브라도 믹스',
      age: '4살',
      gender: '남아',
      location: '인천',
      image: 'https://images.unsplash.com/photo-1636666429444-b34e8b9ffc24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGxhYnJhZG9yJTIwZG9nfGVufDF8fHx8MTc2ODM1NzY1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      description: '온순하고 침착한 까망이에요. 산책을 좋아하고 다른 강아지들과도 잘 어울립니다.',
    },
    {
      id: 5,
      name: '복실',
      breed: '코기 믹스',
      age: '2살',
      gender: '여아',
      location: '대전',
      image: 'https://images.unsplash.com/photo-1654995159231-91401633f72e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JnaSUyMGRvZyUyMGhhcHB5fGVufDF8fHx8MTc2ODM1NzY1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      description: '애교 많고 사랑스러운 복실이에요. 짧은 다리로 총총 걷는 모습이 매력적입니다.',
    },
    {
      id: 6,
      name: '해피',
      breed: '리트리버 믹스',
      age: '3살',
      gender: '남아',
      location: '서울',
      image: 'https://images.unsplash.com/photo-1720705313994-12cd7930da3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZyUyMGFkb3B0aW9ufGVufDF8fHx8MTc2ODMwNjg2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      description: '이름처럼 항상 행복한 해피에요. 공놀이를 좋아하고 에너지가 넘칩니다.',
    },
  ];

  return (
    <section id="adoption" className="py-24 bg-[hsl(var(--surface))]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[hsl(var(--primary))]/10 rounded-full mb-4">
            <span className="text-[hsl(var(--primary))]">Adoption</span>
          </div>
          <h2 className="text-[hsl(var(--secondary))] mb-4">입양 가능한 강아지들</h2>
          <p className="text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto">
            사랑이 필요한 친구들이 새로운 가족을 기다리고 있습니다
          </p>
        </div>

        {/* Dogs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {dogs.map((dog) => (
            <DogCard key={dog.id} {...dog} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            더 많은 강아지 보기
          </Button>
        </div>

        {/* Info Box */}
        <div className="mt-16 bg-white p-8 lg:p-12 rounded-3xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[hsl(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <h4 className="text-[hsl(var(--secondary))] mb-2">입양 절차</h4>
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                상담 → 가정 방문 → 입양 교육 → 입양 결정
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[hsl(var(--accent))]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h4 className="text-[hsl(var(--secondary))] mb-2">입양 비용</h4>
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                기본 의료비 15~20만원 (중성화, 접종 포함)
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[hsl(var(--primary))]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📞</span>
              </div>
              <h4 className="text-[hsl(var(--secondary))] mb-2">입양 문의</h4>
              <p className="text-sm text-[hsl(var(--text-secondary))]">
                평일 10:00-18:00 | 02-1234-5678
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
