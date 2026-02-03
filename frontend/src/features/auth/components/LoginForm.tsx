import imgImage48 from "@/assets/images/social_login_kakao.png";
import imgImage47 from "@/assets/images/sicial_login_naver.png";
import imgImage46 from "@/assets/images/social_login_google.png";
import imgMungshall2 from "@/assets/images/mung.png";
import useAuth from "@/features/auth/hooks/useAuth";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import AlertModal from "@/shared/components/AlertModal";
import { useAlertModal } from "@/shared/hooks/useAlertModal";
import { primaryButtonClass, secondaryButtonClass } from "@/shared/ui/buttonClasses";
import { ApiError } from "@/shared/api/client";

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
          ?åÏõêÍ∞Ä??
        </Link>
        <span>{`  |  `}</span>
        <Link className="underline" to="/auth/find-id">
          ?ÑÏù¥?îÏ∞æÍ∏?
        </Link>
        <span>{`  |  `}</span>
        <Link className="underline" to="/auth/find-pw">
          ÎπÑÎ?Î≤àÌò∏ Ï∞æÍ∏∞
        </Link>
      </p>
    </div>
  );
}

function SocialBtn({
  top,
  icon,
  label,
  onClick,
}: {
  top: string;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute left-[905px] ${top} h-[36px] w-[350px] rounded-[8px] bg-white px-[12px] py-[8px] flex items-center justify-center border border-[#e5e5e5] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] ${secondaryButtonClass}`}
    >
      <div className="relative flex items-center">
        <span className="pr-2">
          <img src={icon} alt="" className="h-4 w-4" />
        </span>
        <span className="text-[14px] font-medium leading-[20px] text-[#0a0a0a]">{label}</span>
      </div>
    </button>
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

type SocialProvider = "google" | "naver" | "kakao";

const getOAuthUrl = (provider: SocialProvider) => {
  const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "/api").replace(/\/$/, "");
  return `${apiBase}/auth/oauth/${provider}`;
};

const DEFAULT_ERROR_MESSAGE = "?úÎ≤Ñ ?§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§. ?†Ïãú ???§Ïãú ?úÎèÑ??Ï£ºÏÑ∏??";

function parseErrorMessage(rawMessage: string) {
  const trimmed = rawMessage.trim();
  if (!trimmed) return "";
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed.message === "string") {
      return parsed.message;
    }
  } catch {
    // ignore JSON parse errors
  }
  return trimmed;
}

function resolveErrorMessage(err: unknown) {
  if (err instanceof ApiError) {
    const parsed = parseErrorMessage(err.message);
    if (parsed) return parsed;
    if (err.status === 400) return "?ÖÎ†•Í∞íÏùÑ ?ïÏù∏??Ï£ºÏÑ∏??";
    if (err.status === 401 || err.status === 403) return "Î°úÍ∑∏?∏Ïù¥ ?ÑÏöî?òÍ±∞??Í∂åÌïú???ÜÏäµ?àÎã§.";
    if (err.status === 404) return "?îÏ≤≠??Í∏∞Îä•??Ï∞æÏùÑ ???ÜÏäµ?àÎã§.";
    if (err.status === 500) return DEFAULT_ERROR_MESSAGE;
    return DEFAULT_ERROR_MESSAGE;
  }

  const rawMessage = err instanceof Error ? err.message : "";
  const parsed = parseErrorMessage(rawMessage);
  return parsed || DEFAULT_ERROR_MESSAGE;
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { openAlert, alertProps } = useAlertModal();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { error?: string } | null;
    if (!state?.error) return;
    openAlert({ title: "∑Œ±◊¿Œ « ø‰", message: state.error });
    navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate, openAlert]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      openAlert({ title: "Î°úÍ∑∏???§Ìå®", message: "?ÑÏù¥?îÏ? ÎπÑÎ?Î≤àÌò∏Î•??ÖÎ†•?¥Ï£º?∏Ïöî." });
      return;
    }
    setLoading(true);
    try {
      const loggedInUser = await login({ username: username.trim(), password });
      const userType = loggedInUser?.userType?.toLowerCase();
      const nextRoute = userType === "shelter" || userType === "center" ? ROUTES.center : ROUTES.mypage;
      navigate(nextRoute);
    } catch (err) {
      openAlert({ title: "Î°úÍ∑∏???§Ìå®", message: resolveErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    handleLogin();
  };

  const handleSocialLogin = (provider: SocialProvider) => {
    window.location.assign(getOAuthUrl(provider));
  };

  return (
    <form className="absolute left-0 top-0" data-name="login" onSubmit={handleSubmit}>
      <Back />

      <p
        className="absolute left-[905px] top-[306px] text-[40px] font-medium leading-[64px] text-[#3182f6]
                  font-['Noto_Sans_KR','Noto Sans KR',sans-serif] whitespace-nowrap break-keep"
      >
        Login
      </p>

      <input
        className="absolute left-[905px] top-[370px] h-[36px] w-[350px] rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] outline-none"
        placeholder="?ÑÏù¥??
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <input
        type="password"
        className="absolute left-[905px] top-[422px] h-[36px] w-[350px] rounded-[8px] border border-[#e5e5e5] px-[12px] text-[14px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] outline-none"
        placeholder="ÎπÑÎ?Î≤àÌò∏"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button
        className={`absolute left-[905px] top-[472.5px] h-[36px] w-[350px] rounded-[10px] bg-[#3182f6] px-[16px] py-[8px] text-[14px] font-medium leading-[20px] text-[#fafafa] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] disabled:bg-[#9ab8f6] ${primaryButtonClass}`}
        type="submit"
        disabled={loading}
      >
        {loading ? "Î°úÍ∑∏??Ï§?.." : "Log In"}
      </button>

      <Divider />

      <SocialBtn
        top="top-[554.5px]"
        icon={imgImage46}
        label="Google"
        onClick={() => handleSocialLogin("google")}
      />
      <SocialBtn
        top="top-[605.5px]"
        icon={imgImage47}
        label="NAVER"
        onClick={() => handleSocialLogin("naver")}
      />
      <SocialBtn
        top="top-[656.5px]"
        icon={imgImage48}
        label="Kakao"
        onClick={() => handleSocialLogin("kakao")}
      />

      <Text />

      <AlertModal {...alertProps} />
    </form>
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





