import { useState } from 'react';
import { Button } from './Button';

type DonationType = 'regular' | 'onetime';
type DonorType = 'individual' | 'organization';

export function DonationSection() {
  const [donationType, setDonationType] = useState<DonationType>('regular');
  const [donorType, setDonorType] = useState<DonorType>('individual');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(30000);
  const [customAmount, setCustomAmount] = useState('');

  const regularAmounts = [10000, 30000, 50000, 100000];
  const onetimeAmounts = [10000, 30000, 50000, 100000, 300000, 500000];

  return (
    <section id="donation" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-[hsl(var(--primary))]/10 rounded-full mb-4">
            <span className="text-[hsl(var(--primary))]">Donation</span>
          </div>
          <h2 className="text-[hsl(var(--secondary))] mb-4">후원하기</h2>
          <p className="text-lg text-[hsl(var(--text-secondary))] max-w-2xl mx-auto">
            여러분의 소중한 후원이 유기견들에게 새로운 희망이 됩니다
          </p>
        </div>

        {/* Donation Type Toggle */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setDonationType('regular')}
            className={`px-8 py-4 rounded-2xl transition-all duration-200 ${
              donationType === 'regular'
                ? 'bg-[hsl(var(--primary))] text-white shadow-lg'
                : 'bg-[hsl(var(--surface))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--border))]'
            }`}
          >
            <div className="text-lg font-semibold">정기후원</div>
            <div className="text-sm opacity-90 mt-1">매월 지속적인 지원</div>
          </button>
          <button
            onClick={() => setDonationType('onetime')}
            className={`px-8 py-4 rounded-2xl transition-all duration-200 ${
              donationType === 'onetime'
                ? 'bg-[hsl(var(--primary))] text-white shadow-lg'
                : 'bg-[hsl(var(--surface))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--border))]'
            }`}
          >
            <div className="text-lg font-semibold">일시후원</div>
            <div className="text-sm opacity-90 mt-1">한 번의 따뜻한 마음</div>
          </button>
        </div>

        {/* Donation Form */}
        <div className="max-w-3xl mx-auto bg-[hsl(var(--surface))] rounded-3xl p-8 lg:p-12">
          <form className="space-y-8">
            {/* Amount Selection */}
            <div>
              <label className="block text-[hsl(var(--secondary))] mb-4">후원금액</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {(donationType === 'regular' ? regularAmounts : onetimeAmounts).map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`py-4 rounded-xl transition-all duration-200 ${
                      selectedAmount === amount
                        ? 'bg-[hsl(var(--primary))] text-white shadow-md'
                        : 'bg-white text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--border))]'
                    }`}
                  >
                    {amount.toLocaleString()}원
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="직접 입력"
                  value={customAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setCustomAmount(value);
                    if (value) setSelectedAmount(null);
                  }}
                  className="flex-1 px-4 py-3 bg-white rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))]"
                />
                <span className="flex items-center px-4 text-[hsl(var(--text-secondary))]">원</span>
              </div>
            </div>

            {/* Donor Type */}
            <div>
              <label className="block text-[hsl(var(--secondary))] mb-4">후원자 구분</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDonorType('individual')}
                  className={`flex-1 py-3 rounded-xl transition-all duration-200 ${
                    donorType === 'individual'
                      ? 'bg-[hsl(var(--primary))] text-white'
                      : 'bg-white text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--border))]'
                  }`}
                >
                  개인
                </button>
                <button
                  type="button"
                  onClick={() => setDonorType('organization')}
                  className={`flex-1 py-3 rounded-xl transition-all duration-200 ${
                    donorType === 'organization'
                      ? 'bg-[hsl(var(--primary))] text-white'
                      : 'bg-white text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--border))]'
                  }`}
                >
                  기업/단체
                </button>
              </div>
            </div>

            {/* Personal Information */}
            {donorType === 'individual' ? (
              <div className="space-y-4">
                <h4 className="text-[hsl(var(--secondary))]">개인정보</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="이름"
                    className="px-4 py-3 bg-white rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))]"
                  />
                  <input
                    type="tel"
                    placeholder="연락처"
                    className="px-4 py-3 bg-white rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))]"
                  />
                </div>
                <input
                  type="email"
                  placeholder="이메일"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))]"
                />
                <input
                  type="text"
                  placeholder="주민등록번호 (기부금 영수증 발급용, 선택)"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))]"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-[hsl(var(--secondary))]">기업/단체 정보</h4>
                <input
                  type="text"
                  placeholder="기업/단체명"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))]"
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="담당자명"
                    className="px-4 py-3 bg-white rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))]"
                  />
                  <input
                    type="tel"
                    placeholder="연락처"
                    className="px-4 py-3 bg-white rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="사업자등록번호 (기부금 영수증 발급용, 선택)"
                  className="w-full px-4 py-3 bg-white rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))]"
                />
              </div>
            )}

            {/* Payment Method */}
            <div>
              <label className="block text-[hsl(var(--secondary))] mb-4">결제수단</label>
              <select className="w-full px-4 py-3 bg-white rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))]">
                <option>CMS 자동이체</option>
                <option>신용카드</option>
                <option>계좌이체</option>
              </select>
            </div>

            {/* Bank Account Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <select className="px-4 py-3 bg-white rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))]">
                <option>은행 선택</option>
                <option>KB국민은행</option>
                <option>신한은행</option>
                <option>우리은행</option>
                <option>하나은행</option>
                <option>농협은행</option>
                <option>기업은행</option>
              </select>
              <input
                type="text"
                placeholder="계좌번호"
                className="px-4 py-3 bg-white rounded-xl border border-[hsl(var(--border))] focus:outline-none focus:border-[hsl(var(--primary))]"
              />
            </div>

            {/* Withdrawal Date (for regular donation) */}
            {donationType === 'regular' && (
              <div>
                <label className="block text-[hsl(var(--secondary))] mb-4">출금일</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {[5, 10, 15, 20, 25, '말일'].map((date) => (
                    <button
                      key={date}
                      type="button"
                      className="py-3 bg-white rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--primary))] hover:text-white hover:border-[hsl(var(--primary))] transition-colors"
                    >
                      {date}일
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notice */}
            <div className="bg-white p-6 rounded-xl text-sm text-[hsl(var(--text-secondary))] space-y-2">
              <p>※ 첫 후원은 당월 납입일을 포함한 재출금일에 이루어집니다.</p>
              <p>※ 매월 후원금 납입일은 5일이며 미출금된 경우 재출금일은 10, 15, 20, 25, 매월 말일입니다.</p>
              <p>※ CMS자동이체 신청 시 전자금융거래법 제15조 및 동법 시행령 제10조에 따라 출금동의 인증이 필요합니다.</p>
              <p>※ 휴대전화번호 형식의 평생계좌는 CMS자동이체신청이 불가합니다.</p>
              <p>※ 기부금 영수증은 개인정보 기재 시 다음 년도 연말정산 기간 내 홈택스에서 조회하실 수 있습니다.</p>
              <p>※ 정기후원 해지는 support@foreverhome.org 로 문의해주세요.</p>
            </div>

            {/* Agreement */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1" />
                <span className="text-sm text-[hsl(var(--text-secondary))]">
                  개인정보 수집 및 이용에 동의합니다 (필수)
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1" />
                <span className="text-sm text-[hsl(var(--text-secondary))]">
                  후원금 사용 내역 및 소식 안내 수신에 동의합니다 (선택)
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" size="lg" className="w-full">
              {donationType === 'regular' ? '정기후원 신청하기' : '일시후원 신청하기'}
            </Button>
          </form>
        </div>

        {/* Impact Stats */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10 p-8 rounded-2xl text-center">
            <div className="text-4xl mb-2">🏥</div>
            <div className="text-2xl font-bold text-[hsl(var(--primary))] mb-2">3만원</div>
            <p className="text-sm text-[hsl(var(--text-secondary))]">
              강아지 한 마리의<br />한 달 의료비
            </p>
          </div>
          <div className="bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10 p-8 rounded-2xl text-center">
            <div className="text-4xl mb-2">🍖</div>
            <div className="text-2xl font-bold text-[hsl(var(--primary))] mb-2">5만원</div>
            <p className="text-sm text-[hsl(var(--text-secondary))]">
              강아지 한 마리의<br />한 달 사료비
            </p>
          </div>
          <div className="bg-gradient-to-br from-[hsl(var(--primary))]/10 to-[hsl(var(--accent))]/10 p-8 rounded-2xl text-center">
            <div className="text-4xl mb-2">🏠</div>
            <div className="text-2xl font-bold text-[hsl(var(--primary))] mb-2">10만원</div>
            <p className="text-sm text-[hsl(var(--text-secondary))]">
              강아지 한 마리의<br />한 달 전체 보호비용
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
