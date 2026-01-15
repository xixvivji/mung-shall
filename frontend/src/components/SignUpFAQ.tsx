import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from './Button';

interface FAQItem {
  question: string;
  answer: string;
}

export function SignUpFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: '회원가입이 안돼요',
      answer: '회원가입 시 이메일 형식이 올바른지, 비밀번호가 8자 이상이며 영문, 숫자, 특수문자를 포함하는지 확인해주세요. 필수 약관에 모두 동의하셨는지도 확인해주세요. 문제가 계속되면 고객센터(02-1234-5678)로 문의해주세요.',
    },
    {
      question: '비밀번호 규칙이 궁금해요',
      answer: '안전한 계정 보호를 위해 비밀번호는 8자 이상이어야 하며, 영문, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다. 개인정보(이름, 생년월일 등)를 비밀번호로 사용하지 않는 것을 권장합니다.',
    },
    {
      question: '알림 설정은 어디서 바꾸나요?',
      answer: '로그인 후 [마이페이지] > [알림 설정]에서 이메일 알림, 문자 알림을 개별적으로 설정하실 수 있습니다. 입양 공고, 후원 내역, 이벤트 등 카테고리별로 알림을 선택할 수 있습니다.',
    },
    {
      question: '후원 영수증은 어디서 확인하나요?',
      answer: '[마이페이지] > [후원 내역]에서 모든 후원 내역을 확인하실 수 있습니다. 각 후원 건마다 영수증 발급 버튼이 있으며, 연말정산용 기부금 영수증은 국세청 홈택스에서도 조회 가능합니다.',
    },
    {
      question: '탈퇴하고 싶어요',
      answer: '[마이페이지] > [설정] > [회원 탈퇴]에서 탈퇴하실 수 있습니다. 탈퇴 시 모든 개인정보가 삭제되며, 저장한 관심 강아지 목록과 포인트도 함께 삭제됩니다. 정기후원 중이시라면 후원을 먼저 해지해주세요.',
    },
    {
      question: '이메일을 변경하고 싶어요',
      answer: '[마이페이지] > [설정] > [계정 정보]에서 이메일 주소를 변경하실 수 있습니다. 변경 시 새로운 이메일로 인증 메일이 발송되며, 인증 완료 후 변경이 완료됩니다.',
    },
    {
      question: '로그인이 안돼요',
      answer: '이메일 주소와 비밀번호를 정확히 입력했는지 확인해주세요. 비밀번호를 잊으셨다면 로그인 페이지의 [비밀번호 찾기]를 이용해주세요. 가입하신 이메일로 비밀번호 재설정 링크를 보내드립니다.',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[hsl(var(--primary))]/10 rounded-full mb-4">
            <span className="text-[hsl(var(--primary))]">FAQ</span>
          </div>
          <h2 className="text-[hsl(var(--secondary))] mb-4">자주 묻는 질문</h2>
          <p className="text-lg text-[hsl(var(--text-secondary))]">
            회원가입과 관련하여 궁금하신 점을 확인해보세요
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[hsl(var(--surface))] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-[hsl(var(--border))]"
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
              <span>support@savethemungz.org</span>
            </div>
          </div>
          <div className="mt-6">
            <Button 
              variant="outline" 
              className="bg-white text-[hsl(var(--primary))] hover:bg-white/90 border-white"
              onClick={() => window.location.href = '/#faq'}
            >
              문의하기
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-75">평일 10:00 - 18:00 (주말 및 공휴일 휴무)</p>
        </div>
      </div>
    </section>
  );
}
