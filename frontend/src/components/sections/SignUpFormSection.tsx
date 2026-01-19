import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import { Button } from "../ui/Button";
import { Container } from "../layout/Container";

type FormData = {
  nickname: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone: string;
};

type Agreements = {
  all: boolean;
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
};

type InputFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  helperText?: string;
} & InputHTMLAttributes<HTMLInputElement>;

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function InputField({
  id,
  label,
  required,
  helperText,
  className,
  ...props
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
        {required ? <span className="ml-1 text-primary">*</span> : null}
      </label>
      <input
        id={id}
        className={cx(
          "h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm text-ink placeholder:text-slate-400",
          "focus:border-ink focus:outline-none focus:ring-4 focus:ring-slate-200",
          className
        )}
        {...props}
      />
      {helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
}

export function SignUpFormSection() {
  const [formData, setFormData] = useState<FormData>({
    nickname: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
  });

  const [agreements, setAgreements] = useState<Agreements>({
    all: false,
    terms: false,
    privacy: false,
    marketing: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleAllAgreement = (checked: boolean) => {
    setAgreements({
      all: checked,
      terms: checked,
      privacy: checked,
      marketing: checked,
    });
  };

  const handleAgreementChange = (key: keyof Agreements, checked: boolean) => {
    setAgreements((prev) => {
      const next = { ...prev, [key]: checked };
      next.all = next.terms && next.privacy && next.marketing;
      return next;
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    console.log("Form submitted:", formData, agreements);
  };

  return (
    <section id="signup" className="border-t border-line bg-white">
      <Container className="py-20">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              회원가입
            </h2>
            <p className="mt-2 text-base text-slate-600">
              필요한 정보만 입력하고 멍쉘의 입양 여정을 시작해보세요.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-line bg-surface p-8 shadow-soft md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                id="nickname"
                label="닉네임"
                placeholder="사용하실 닉네임을 입력하세요"
                required
                value={formData.nickname}
                onChange={(event) =>
                  setFormData({ ...formData, nickname: event.target.value })
                }
                helperText="2~10자 이내로 입력해주세요."
              />

              <InputField
                id="email"
                label="이메일"
                type="email"
                placeholder="example@email.com"
                required
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                autoComplete="email"
              />

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-ink">
                  비밀번호
                  <span className="ml-1 text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="8자 이상 영문, 숫자, 특수문자 포함"
                    value={formData.password}
                    onChange={(event) =>
                      setFormData({ ...formData, password: event.target.value })
                    }
                    autoComplete="new-password"
                    className={cx(
                      "h-12 w-full rounded-2xl border border-line bg-white px-4 pr-16 text-sm text-ink placeholder:text-slate-400",
                      "focus:border-ink focus:outline-none focus:ring-4 focus:ring-slate-200"
                    )}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-ink"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? "숨기기" : "보기"}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="passwordConfirm" className="block text-sm font-medium text-ink">
                  비밀번호 확인
                  <span className="ml-1 text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    id="passwordConfirm"
                    type={showPasswordConfirm ? "text" : "password"}
                    placeholder="비밀번호를 다시 입력하세요"
                    value={formData.passwordConfirm}
                    onChange={(event) =>
                      setFormData({ ...formData, passwordConfirm: event.target.value })
                    }
                    autoComplete="new-password"
                    className={cx(
                      "h-12 w-full rounded-2xl border border-line bg-white px-4 pr-16 text-sm text-ink placeholder:text-slate-400",
                      "focus:border-ink focus:outline-none focus:ring-4 focus:ring-slate-200"
                    )}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-ink"
                    onClick={() => setShowPasswordConfirm((prev) => !prev)}
                    aria-pressed={showPasswordConfirm}
                  >
                    {showPasswordConfirm ? "숨기기" : "보기"}
                  </button>
                </div>
              </div>

              <InputField
                id="phone"
                label="휴대폰 번호"
                type="tel"
                placeholder="010-0000-0000"
                value={formData.phone}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                helperText="선택사항입니다. 입력 시 문자 알림을 받을 수 있어요."
                autoComplete="tel"
              />

              <div className="border-t border-line pt-4" />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-ink">약관 동의</h3>
                <div className="space-y-4 rounded-2xl border border-line bg-muted p-4">
                  <label className="flex items-center gap-3 text-sm text-ink">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-ink"
                      checked={agreements.all}
                      onChange={(event) => handleAllAgreement(event.target.checked)}
                    />
                    <span className="font-semibold">전체 동의</span>
                  </label>

                  <div className="h-px bg-line" />

                  <label className="flex items-start gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-ink"
                      checked={agreements.terms}
                      onChange={(event) =>
                        handleAgreementChange("terms", event.target.checked)
                      }
                    />
                    <span>
                      이용약관 동의 <span className="text-primary">(필수)</span>{" "}
                      <a href="#" className="text-ink underline underline-offset-4">
                        보기
                      </a>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-ink"
                      checked={agreements.privacy}
                      onChange={(event) =>
                        handleAgreementChange("privacy", event.target.checked)
                      }
                    />
                    <span>
                      개인정보 처리방침 동의{" "}
                      <span className="text-primary">(필수)</span>{" "}
                      <a href="#" className="text-ink underline underline-offset-4">
                        보기
                      </a>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-ink"
                      checked={agreements.marketing}
                      onChange={(event) =>
                        handleAgreementChange("marketing", event.target.checked)
                      }
                    />
                    <span>입양 공고 알림 수신 동의 (이메일/문자)</span>
                  </label>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full">
                가입하고 시작하기
              </Button>

              <p className="text-center text-sm text-slate-500">
                이미 계정이 있나요?{" "}
                <a href="/login" className="font-semibold text-ink underline underline-offset-4">
                  로그인
                </a>
              </p>
            </form>
          </div>

          <div className="mt-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs text-slate-500">
              안전한 암호화로 개인정보를 보호합니다
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
