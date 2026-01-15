import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Checkbox } from './Checkbox';

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic here
    console.log('Login submitted:', formData, { rememberMe });
  };

  return (
    <section id="login-form" className="py-24 bg-white">
      <div className="max-w-xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-[hsl(var(--secondary))] mb-4">로그인</h2>
          <p className="text-lg text-[hsl(var(--text-secondary))]">
            이메일과 비밀번호로 로그인하세요
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[hsl(var(--surface))] rounded-3xl p-8 lg:p-12 shadow-sm border border-[hsl(var(--border))]">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="비밀번호를 입력하세요"
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
              {errors.password && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <span>⚠️</span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <Checkbox
                label="로그인 상태 유지"
                checked={rememberMe}
                onChange={setRememberMe}
              />
              <a
                href="/forgot-password"
                className="text-sm text-[hsl(var(--primary))] hover:underline"
              >
                비밀번호 찾기
              </a>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" size="lg" className="w-full">
              로그인
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[hsl(var(--border))]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[hsl(var(--surface))] text-[hsl(var(--text-secondary))]">
                  또는
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full h-12 px-4 rounded-xl border-2 border-[hsl(var(--border))] hover:bg-[hsl(var(--surface))] transition-colors flex items-center justify-center gap-3"
              >
                <span className="text-xl">🔵</span>
                <span className="font-medium text-[hsl(var(--secondary))]">카카오로 로그인</span>
              </button>
              <button
                type="button"
                className="w-full h-12 px-4 rounded-xl border-2 border-[hsl(var(--border))] hover:bg-[hsl(var(--surface))] transition-colors flex items-center justify-center gap-3"
              >
                <span className="text-xl">🟢</span>
                <span className="font-medium text-[hsl(var(--secondary))]">네이버로 로그인</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-[hsl(var(--text-secondary))] pt-4">
              아직 계정이 없으신가요?{' '}
              <a href="/signup" className="text-[hsl(var(--primary))] font-medium hover:underline">
                회원가입
              </a>
            </p>
          </form>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--surface))] rounded-full text-sm text-[hsl(var(--text-secondary))]">
            <span>🔒</span>
            <span>안전한 로그인</span>
          </div>
        </div>
      </div>
    </section>
  );
}
