import imgMungshall2 from "@/assets/images/mung.png";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import { checkUsername, sendEmailCode, signup, verifyEmailCode } from "../api/authApi";

type FieldProps = {
  label: string;
  required?: boolean;
  topLabel: number;
  topBox: number;
  left?: number;
  width?: number;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
};

type Status = {
  type: "success" | "error";
  text: string;
};

const LEFT = 863;
const BOX_W = 350;

function Back() {
  return (
    <div
      className="absolute left-[678px] top-[142px] h-[800px] w-[720px] bg-white"
      data-name="back"
    />
  );
}

function Label({
  text,
  required,
  top,
  left = LEFT,
  width = 326,
}: {
  text: string;
  required?: boolean;
  top: number;
  left?: number;
  width?: number;
}) {
  return (
    <div className="absolute flex items-center" style={{ left, top, width }}>
      <p className="font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[14px] font-medium text-[#737373]">
        {text} {required && <span className="text-[#ff383c]">*</span>}
      </p>
    </div>
  );
}

function Box({
  top,
  left = LEFT,
  width = BOX_W,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  top: number;
  left?: number;
  width?: number;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type={type}
      className="absolute h-[36px] rounded-[8px] border border-[#e5e5e5] bg-white px-[12px] text-[14px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] outline-none"
      style={{ left, top, width }}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function PrimaryButton({
  text,
  top,
  left,
  width,
  onClick,
  disabled,
}: {
  text: string;
  top: number;
  left: number;
  width: number;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const baseClass =
    "absolute flex h-[36px] items-center justify-center rounded-[10px] px-[16px] py-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)] text-[14px] font-medium leading-[20px]";
  const disabledClass = disabled ? "bg-[#9ab8f6] cursor-not-allowed" : "bg-[#3182f6] cursor-pointer";

  return (
    <button
      type="button"
      className={`${baseClass} ${disabledClass}`}
      style={{ left, top, width }}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[#fafafa] whitespace-nowrap">
        {text}
      </span>
    </button>
  );
}

function Field({
  label,
  required,
  topLabel,
  topBox,
  left = LEFT,
  width = BOX_W,
  placeholder,
  type = "text",
  value,
  onChange,
}: FieldProps) {
  return (
    <>
      <Label text={label} required={required} top={topLabel} left={left} />
      <Box
        top={topBox}
        left={left}
        width={width}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
      />
    </>
  );
}

function TermsText() {
  return (
    <div
      className="absolute left-[863px] top-[945px] flex w-[350px] items-center justify-center"
      data-name="text"
    >
      <p className="text-center font-['Inter:Regular',sans-serif] text-[14px] text-[#737373]">
        By clicking continue, you agree to our{" "}
        <a className="underline" href="https://ui.shadcn.com/terms">
          Terms of Service
        </a>{" "}
        and{" "}
        <a className="underline" href="https://ui.shadcn.com/privacy">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}

function Form() {
  const navigate = useNavigate();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");

  const [usernameChecked, setUsernameChecked] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<Status | null>(null);
  const [emailStatus, setEmailStatus] = useState<Status | null>(null);
  const [signupStatus, setSignupStatus] = useState<Status | null>(null);

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [signingUp, setSigningUp] = useState(false);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameChecked(false);
    setUsernameStatus(null);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailSent(false);
    setEmailVerified(false);
    setEmailCode("");
    setEmailStatus(null);
  };

  const handleCheckUsername = async () => {
    if (!username.trim()) {
      setUsernameStatus({ type: "error", text: "아이디를 입력해주세요." });
      return;
    }
    setCheckingUsername(true);
    setUsernameStatus(null);
    try {
      const result = await checkUsername(username.trim());
      if (result.isAvailable) {
        setUsernameChecked(true);
        setUsernameStatus({ type: "success", text: "사용 가능한 아이디입니다." });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "중복 확인 실패";
      setUsernameChecked(false);
      setUsernameStatus({ type: "error", text: message });
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email.trim()) {
      setEmailStatus({ type: "error", text: "이메일을 입력해주세요." });
      return;
    }
    setSendingCode(true);
    setEmailStatus(null);
    try {
      await sendEmailCode(email.trim());
      setEmailSent(true);
      setEmailStatus({ type: "success", text: "인증번호를 발송했습니다." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "발송 실패";
      setEmailSent(false);
      setEmailStatus({ type: "error", text: message });
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!email.trim() || !emailCode.trim()) {
      setEmailStatus({ type: "error", text: "이메일과 인증번호를 입력해주세요." });
      return;
    }
    setVerifyingCode(true);
    setEmailStatus(null);
    try {
      const result = await verifyEmailCode(email.trim(), emailCode.trim());
      if (result.isVerified) {
        setEmailVerified(true);
        setEmailStatus({ type: "success", text: "이메일 인증이 완료되었습니다." });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "인증 실패";
      setEmailVerified(false);
      setEmailStatus({ type: "error", text: message });
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSignup = async () => {
    setSignupStatus(null);

    if (!usernameChecked) {
      setSignupStatus({ type: "error", text: "아이디 중복 확인이 필요합니다." });
      return;
    }
    if (!emailVerified) {
      setSignupStatus({ type: "error", text: "이메일 인증이 필요합니다." });
      return;
    }
    if (!password || password !== passwordConfirm) {
      setSignupStatus({ type: "error", text: "비밀번호를 확인해주세요." });
      return;
    }
    if (!name.trim() || !email.trim()) {
      setSignupStatus({ type: "error", text: "필수 항목을 입력해주세요." });
      return;
    }

    const mergedAddress = addressDetail.trim()
      ? `${address.trim()} ${addressDetail.trim()}`
      : address.trim();

    setSigningUp(true);
    try {
      await signup({
        username: username.trim(),
        password,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        address: mergedAddress || undefined,
      });
      setSignupStatus({ type: "success", text: "회원가입이 완료되었습니다." });
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
      redirectTimerRef.current = setTimeout(() => {
        navigate(ROUTES.login);
      }, 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : "회원가입 실패";
      setSignupStatus({ type: "error", text: message });
    } finally {
      setSigningUp(false);
    }
  };

  const canSignup = Boolean(
    username.trim() &&
      password &&
      passwordConfirm &&
      name.trim() &&
      email.trim() &&
      password === passwordConfirm &&
      usernameChecked &&
      emailVerified,
  );

  const usernameStatusClass =
    usernameStatus?.type === "success" ? "text-[#2f9e44]" : "text-[#d14343]";
  const emailStatusClass =
    emailStatus?.type === "success" ? "text-[#2f9e44]" : "text-[#d14343]";
  const signupStatusClass =
    signupStatus?.type === "success" ? "text-[#2f9e44]" : "text-[#d14343]";

  return (
    <div className="absolute left-0 top-0" data-name="input">
      <Back />

      <p
        className="absolute left-[863px] top-[200px] text-[40px] font-medium leading-[64px] text-[#3182f6]
                   font-['Noto Sans KR',sans-serif] whitespace-nowrap break-keep"
      >
        회원가입
      </p>

      <Label text="아이디" required top={274} left={LEFT} />
      <Box
        top={297}
        left={LEFT}
        width={250}
        placeholder="아이디 입력(6~20자)"
        value={username}
        onChange={handleUsernameChange}
      />
      <PrimaryButton
        text={checkingUsername ? "확인중..." : "중복확인"}
        top={297}
        left={1126}
        width={87}
        onClick={handleCheckUsername}
        disabled={checkingUsername}
      />
      {usernameStatus ? (
        <p
          className={`absolute left-[863px] top-[333px] w-[350px] text-[12px] whitespace-nowrap ${usernameStatusClass}`}
        >
          {usernameStatus.text}
        </p>
      ) : null}

      <Field
        label="비밀번호"
        required
        topLabel={345}
        topBox={368}
        placeholder="비밀번호 입력 (문자, 숫자, 특수문자 포함 8~20자)"
        type="password"
        value={password}
        onChange={setPassword}
      />

      <Field
        label="비밀번호 확인"
        required
        topLabel={416}
        topBox={439}
        placeholder="비밀번호 재입력"
        type="password"
        value={passwordConfirm}
        onChange={setPasswordConfirm}
      />

      <Field
        label="이름"
        required
        topLabel={487}
        topBox={510}
        placeholder="이름을 입력해주세요"
        value={name}
        onChange={setName}
      />

      <Label text="이메일 주소" required top={558} left={LEFT} />
      <Box
        top={581}
        left={LEFT}
        width={234}
        placeholder="이메일 주소"
        value={email}
        onChange={handleEmailChange}
      />
      <PrimaryButton
        text={sendingCode ? "발송중..." : "인증번호 발송"}
        top={581}
        left={1093}
        width={120}
        onClick={handleSendEmail}
        disabled={sendingCode}
      />

      <Box
        top={622}
        left={LEFT}
        width={256}
        placeholder="인증번호 (6자리 입력)"
        value={emailCode}
        onChange={(value) => {
          setEmailCode(value);
          setEmailVerified(false);
        }}
      />
      <PrimaryButton
        text={verifyingCode ? "인증중..." : "인증하기"}
        top={622}
        left={1126}
        width={87}
        onClick={handleVerifyEmail}
        disabled={!emailSent || verifyingCode}
      />
      {emailStatus ? (
        <p
          className={`absolute left-[863px] top-[658px] w-[350px] text-[12px] whitespace-nowrap ${emailStatusClass}`}
        >
          {emailStatus.text}
        </p>
      ) : null}

      <Field
        label="전화번호"
        topLabel={678}
        topBox={701}
        placeholder="휴대폰 번호 입력 ('-' 제외 11자리 입력)"
        value={phone}
        onChange={setPhone}
      />

      <Label text="주소" top={749} left={LEFT} />
      <Box
        top={772}
        left={LEFT}
        width={BOX_W}
        placeholder="주소를 입력해주세요"
        value={address}
        onChange={setAddress}
      />
      <Box
        top={813}
        left={LEFT}
        width={BOX_W}
        placeholder="상세주소"
        value={addressDetail}
        onChange={setAddressDetail}
      />

      <PrimaryButton
        text={signingUp ? "가입중..." : "회원가입"}
        top={899}
        left={LEFT}
        width={350}
        onClick={handleSignup}
        disabled={!canSignup || signingUp}
      />
      {signupStatus ? (
        <p
          className={`absolute left-[863px] top-[935px] w-[350px] text-[12px] whitespace-nowrap ${signupStatusClass}`}
        >
          {signupStatus.text}
        </p>
      ) : null}

      <TermsText />
    </div>
  );
}

export default function Component052Signup() {
  return (
    <div className="min-h-screen bg-white overflow-x-auto">
      <div className="relative mx-auto h-[1024px] w-[1440px]" data-name="05-2_Signup">
        <Form />

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
