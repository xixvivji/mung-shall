import imgImage48 from "@/assets/images/social_login_kakao.png";
import imgImage47 from "@/assets/images/sicial_login_naver.png";
import imgImage46 from "@/assets/images/social_login_google.png";
import imgMungshall2 from "@/assets/images/mung.png";
import useAuth from "@/features/auth/hooks/useAuth";
import { useState } from "react";
import { Link } from "react-router-dom";

function Back() {
  return (
    <div className="absolute left-[720px] top-0 h-full w-[720px] bg-white" data-name="back" />
  );
}

function Text() {
  return (
    <div
      className="absolute left-[905px] top-[720px] w-[350px] flex items-center justify-center"
      data-name="Text"
    >
      <p className="text-center text-[14px] leading-[20px] text-[#737373]">
        <Link className="underline" to="/auth/signup">
          회원가입
        </Link>
        <span>{`  |  `}</span>
        <Link className="underline" to="/auth/find-id">
          아이디찾기
        </Link>
        <span>{`  |  `}</span>
        <Link className="underline" to="/auth/find-pw">
          비밀번호 찾기
        </Link>
      </p>
    </div>
  );
}

function SocialBtn({ top, icon, label }: { top: string; icon: string; label: string }) {
  return (
    <div
      className={`absolute left-[905px] ${top} h-[36px] w-[350px] rounded-[8px] bg-white px-[12px] py-[8px] flex items-center justify-center`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[8px] border border-[#e5e5e5] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)]"
      />
      <div className="relative flex items-center">
        <span className="pr-2">
          <img src={icon} alt="" className="h-4 w-4" />
        </span>
        <span className="text-[14px] font-medium leading-[20px] text-[#0a0a0a]">{label}</span>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="absolute left-[905px] top-[523.5px] flex w-[350px] items-center" data-name="Divider">
      <div className="h-px flex-1 bg-[#e5e5e5]" />
      <div className="px-2 text-center text-[12px] leading-[16px] text-[#737373] w-[138px]">
        OR CONTINUE WITH
      </div>
      <div className="h-px flex-1 bg-[#e5e5e5]" />
    </div>
  );
}

function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login({ username: username.trim(), password });
    } catch (err) {
      const message = err instanceof Error ? err.message : "로그인 실패";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute left-0 top-0" data-name="login">
      <Back />

      <p
        className="absolute left-[905px] top-[306px] text-[40px] font-medium leading-[64px] text-[#3182f6]
                  font-['Noto_Sans_KR','Noto Sans KR',sans-serif] whitespace-nowrap break-keep"
      >
        Login
      </p>

      <input
        className="absolute left-[905px] top-[370px] h-[36px] w-[350px] rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] outline-none"
        placeholder="아이디"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <input
        type="password"
        className="absolute left-[905px] top-[422px] h-[36px] w-[350px] rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] outline-none"
        placeholder="비밀번호"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button
        className="absolute left-[905px] top-[472.5px] h-[36px] w-[350px] rounded-[10px] bg-[#3182f6] px-[16px] py-[8px] text-[14px] font-medium leading-[20px] text-[#fafafa] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] disabled:bg-[#9ab8f6]"
        type="button"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "로그인 중..." : "Log In"}
      </button>

      {error ? (
        <p className="absolute left-[905px] top-[512px] text-[12px] text-[#d14343]">
          {error}
        </p>
      ) : null}

      <Divider />

      <SocialBtn top="top-[554.5px]" icon={imgImage46} label="Google" />
      <SocialBtn top="top-[605.5px]" icon={imgImage47} label="NAVER" />
      <SocialBtn top="top-[656.5px]" icon={imgImage48} label="Kakao" />

      <Text />
    </div>
  );
}

export default function Component051Login() {
  return (
    <div className="min-h-screen bg-white overflow-x-auto">
      <div className="relative mx-auto h-[902px] w-[1440px]" data-name="05-1_Login">
        <Login />

        <div className="absolute left-[96.5px] top-[142px] h-[720px] w-[527px]" data-name="mungshall 2">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              alt=""
              className="absolute left-[-52.51%] top-0 h-full w-[205.02%] max-w-none"
              src={imgMungshall2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
