import { useState, type FormEvent, type InputHTMLAttributes } from "react";
import { Button } from "../ui/Button";
import { Container } from "../layout/Container";

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
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

export function LoginSection() {
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    console.log("Login submitted:", formData);
  };

  return (
    <section id="login" className="relative overflow-hidden border-t border-line bg-white">
      <div
        aria-hidden="true"
        className="absolute -top-20 right-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-16 left-0 h-64 w-64 rounded-full bg-ink/5 blur-3xl"
      />

      <Container className="relative py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <span className="rounded-full border border-line bg-muted px-3 py-1 text-xs font-semibold text-slate-500">
              Login
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              다시 만나서 반가워요.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              멍쉘에서 관심 강아지를 관리하고, 입양 공고 알림을 빠르게 받아보세요.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-600">
              {[
                "관심 목록 및 입양 일정 확인",
                "후원 내역과 영수증 관리",
                "맞춤형 입양 소식 알림",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-ink" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-line bg-surface p-8 shadow-soft md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                id="login-email"
                label="이메일"
                type="email"
                placeholder="example@email.com"
                required
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                autoComplete="email"
              />

              <div className="space-y-2">
                <label htmlFor="login-password" className="block text-sm font-medium text-ink">
                  비밀번호
                  <span className="ml-1 text-primary">*</span>
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={(event) =>
                      setFormData({ ...formData, password: event.target.value })
                    }
                    autoComplete="current-password"
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

              <div className="flex items-center justify-between text-sm text-slate-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-ink"
                    checked={formData.remember}
                    onChange={(event) =>
                      setFormData({ ...formData, remember: event.target.checked })
                    }
                  />
                  로그인 상태 유지
                </label>
                <a href="#" className="font-semibold text-ink underline underline-offset-4">
                  비밀번호 찾기
                </a>
              </div>

              <Button type="submit" size="lg" className="w-full">
                로그인
              </Button>

              <div className="space-y-3 text-center text-sm text-slate-500">
                <span className="block">처음 오셨나요?</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    window.location.href = "/signup";
                  }}
                >
                  회원가입
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
