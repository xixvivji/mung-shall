import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Checkbox } from './Checkbox';

export function SignUpForm() {
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
  });

  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    marketing: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAllAgreement = (checked: boolean) => {
    setAgreements({
      all: checked,
      terms: checked,
      privacy: checked,
      marketing: checked,
    });
  };

  const handleAgreementChange = (key: keyof typeof agreements, checked: boolean) => {
    const newAgreements = { ...agreements, [key]: checked };
    newAgreements.all = newAgreements.terms && newAgreements.privacy && newAgreements.marketing;
    setAgreements(newAgreements);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation logic here
    console.log('Form submitted:', formData, agreements);
  };

  return (
    <section id="signup-form" className="py-24 bg-white">
      <div className="max-w-2xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-[hsl(var(--secondary))] mb-4">회원가입</h2>
          <p className="text-lg text-[hsl(var(--text-secondary))]">
            간단한 정보만 입력하고 멍즈 가족이 되어보세요
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[hsl(var(--surface))] rounded-3xl p-8 lg:p-12 shadow-sm border border-[hsl(var(--border))]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nickname */}
            <Input
              label="닉네임"
              placeholder="사용하실 닉네임을 입력하세요"
              required
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              error={errors.nickname}
              helperText="2~10자 이내로 입력해주세요"
            />

            {/* Email */}
            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
            />

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[hsl(var(--secondary))]">
                비밀번호
                <span className="text-[hsl(var(--primary))] ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="8자 이상 영문, 숫자, 특수문자 포함"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text))]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Password Confirm */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[hsl(var(--secondary))]">
                비밀번호 확인
                <span className="text-[hsl(var(--primary))] ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-[hsl(var(--border))] focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text))]"
                >
                  {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Phone (Optional) */}
            <Input
              label="휴대폰 번호"
              type="tel"
              placeholder="010-0000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              helperText="선택사항입니다. 입력 시 문자 알림을 받으실 수 있습니다."
            />

            {/* Divider */}
            <div className="pt-4 border-t border-[hsl(var(--border))]"></div>

            {/* Agreements */}
            <div className="space-y-4">
              <h4 className="text-[hsl(var(--secondary))]">약관 동의</h4>
              
              <div className="space-y-4 p-4 bg-white rounded-xl border border-[hsl(var(--border))]">
                <Checkbox
                  label={<span className="font-medium text-[hsl(var(--secondary))]">전체 동의</span>}
                  checked={agreements.all}
                  onChange={handleAllAgreement}
                />
                
                <div className="h-px bg-[hsl(var(--border))]"></div>
                
                <div className="space-y-3">
                  <Checkbox
                    label={
                      <span>
                        이용약관 동의{' '}
                        <a href="#" className="text-[hsl(var(--primary))] underline hover:no-underline">
                          보기
                        </a>
                      </span>
                    }
                    required
                    checked={agreements.terms}
                    onChange={(checked) => handleAgreementChange('terms', checked)}
                  />
                  <Checkbox
                    label={
                      <span>
                        개인정보 처리방침 동의{' '}
                        <a href="#" className="text-[hsl(var(--primary))] underline hover:no-underline">
                          보기
                        </a>
                      </span>
                    }
                    required
                    checked={agreements.privacy}
                    onChange={(checked) => handleAgreementChange('privacy', checked)}
                  />
                  <Checkbox
                    label="입양 공고 알림 수신 동의 (이메일/문자)"
                    checked={agreements.marketing}
                    onChange={(checked) => handleAgreementChange('marketing', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" size="lg" className="w-full">
              가입하고 시작하기
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-[hsl(var(--text-secondary))]">
              이미 계정이 있나요?{' '}
              <a href="/login" className="text-[hsl(var(--primary))] font-medium hover:underline">
                로그인
              </a>
            </p>
          </form>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--surface))] rounded-full text-sm text-[hsl(var(--text-secondary))]">
            <span>🔒</span>
            <span>개인정보는 안전하게 보호됩니다</span>
          </div>
        </div>
      </div>
    </section>
  );
}
