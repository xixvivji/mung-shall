import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: '유기견 입양 절차는 어떻게 되나요?',
      answer: '입양 절차는 다음과 같습니다: 1) 홈페이지에서 입양 가능한 강아지 확인 2) 입양 신청서 작성 및 제출 3) 전화 상담 진행 4) 가정 방문 및 환경 확인 5) 입양 전 교육 이수 6) 입양 계약서 작성 및 서명 7) 입양비 납부 8) 강아지 인계. 전체 과정은 약 1~2주 정도 소요됩니다.',
    },
    {
      question: '입양 비용은 얼마인가요?',
      answer: '입양비는 기본 의료비로 15~20만원 정도입니다. 이 비용에는 중성화 수술, 기본 예방접종, 내외부 기생충 구제, 건강검진 비용이 포함됩니다. 입양비는 다음 유기견들을 구조하고 치료하는데 사용됩니다.',
    },
    {
      question: '입양 후 문제가 생기면 어떻게 하나요?',
      answer: '입양 후에도 지속적인 상담과 지원을 제공합니다. 행동 교정, 건강 문제, 양육 방법 등에 대해 언제든지 문의하실 수 있습니다. 부득이하게 입양을 유지할 수 없는 상황이 발생하면, 절대 유기하지 마시고 저희에게 연락 주세요. 재입양을 도와드립니다.',
    },
    {
      question: '어떤 사람이 입양할 수 있나요?',
      answer: '만 19세 이상 성인이며, 반려견을 평생 책임질 수 있는 경제적 능력과 의지가 있어야 합니다. 가족 모두가 입양에 동의해야 하며, 반려견을 키울 수 있는 주거 환경이 갖춰져 있어야 합니다. 1인 가구, 맞벌이 가구도 환경이 적합하면 입양 가능합니다.',
    },
    {
      question: '후원금은 어떻게 사용되나요?',
      answer: '후원금은 유기견들의 사료비, 의료비, 시설 운영비로 사용됩니다. 구체적으로는 구조 및 치료비(40%), 사료 및 영양제(30%), 시설 운영 및 관리(20%), 입양 캠페인 및 교육(10%)으로 배분됩니다. 모든 사용 내역은 분기별로 홈페이지에 투명하게 공개됩니다.',
    },
    {
      question: '봉사활동은 어떻게 참여할 수 있나요?',
      answer: '봉사활동은 매주 주말에 진행됩니다. 홈페이지에서 봉사 신청을 하시면 담당자가 연락드립니다. 주요 활동은 강아지 산책, 급식 보조, 시설 청소, 목욕 보조 등입니다. 만 16세 이상이면 누구나 참여 가능하며, 미성년자는 보호자 동의가 필요합니다.',
    },
    {
      question: '임시보호는 무엇인가요?',
      answer: '임시보호는 입양 전까지 가정에서 유기견을 돌봐주시는 봉사활동입니다. 센터 공간이 부족하거나 가정 환경이 필요한 강아지들을 위해 꼭 필요한 활동입니다. 사료와 의료비는 센터에서 지원하며, 임시보호 기간은 보통 1~3개월입니다. 임시보호 중 입양을 결정하실 수도 있습니다.',
    },
    {
      question: '기부금 영수증 발급은 어떻게 하나요?',
      answer: '후원 시 주민등록번호나 사업자등록번호를 입력하시면 연말정산 시 국세청 홈택스에서 자동으로 조회됩니다. 별도 신청이 필요한 경우 이메일(support@foreverhome.org)이나 전화(02-1234-5678)로 요청하시면 발급해 드립니다.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-[hsl(var(--surface))]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[hsl(var(--primary))]/10 rounded-full mb-4">
            <span className="text-[hsl(var(--primary))]">FAQ</span>
          </div>
          <h2 className="text-[hsl(var(--secondary))] mb-4">자주 묻는 질문</h2>
          <p className="text-lg text-[hsl(var(--text-secondary))]">
            입양과 후원에 대해 궁금하신 점을 확인해보세요
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="font-semibold text-[hsl(var(--secondary))] pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  size={20}
                  className={`flex-shrink-0 text-[hsl(var(--primary))] transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-[hsl(var(--text-secondary))] leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] p-8 lg:p-12 rounded-3xl text-center text-white">
          <h3 className="text-white mb-4">더 궁금하신 점이 있으신가요?</h3>
          <p className="mb-6 opacity-90">
            언제든지 문의해 주세요. 친절하게 답변해 드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📞</span>
              <span>02-1234-5678</span>
            </div>
            <div className="hidden sm:block text-white/50">|</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📧</span>
              <span>support@foreverhome.org</span>
            </div>
          </div>
          <p className="text-sm mt-6 opacity-75">평일 10:00 - 18:00 (주말 및 공휴일 휴무)</p>
        </div>
      </div>
    </section>
  );
}
