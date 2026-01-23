import imgMungshall2 from "@/assets/images/mung.png";

type FieldProps = {
  label: string;
  required?: boolean;
  topLabel: number; // 라벨 y
  topBox: number;   // 인풋 y
  left?: number;
  width?: number;
  placeholder: string;
};

const LEFT = 863;
const BOX_W = 350;
const BOX_H = 36;

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
}: {
  top: number;
  left?: number;
  width?: number;
  placeholder: string;
}) {
  return (
    <div
      className="absolute h-[36px] rounded-[8px] bg-white"
      style={{ left, top, width }}
    >
      <div className="relative flex h-full items-center overflow-hidden px-[12px] py-[4px]">
        <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[14px] font-medium text-[rgba(115,115,115,0.5)]">
          {placeholder}
        </p>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[8px] border border-[#e5e5e5] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)]"
      />
    </div>
  );
}

function PrimaryButton({
  text,
  top,
  left,
  width,
}: {
  text: string;
  top: number;
  left: number;
  width: number;
}) {
  return (
    <div
      className="absolute flex h-[36px] items-center justify-center rounded-[10px] bg-[#3182f6] px-[16px] py-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)]"
      style={{ left, top, width }}
    >
      <p className="font-['Inter:Medium','Noto_Sans_KR:Medium',sans-serif] text-[14px] font-medium leading-[20px] text-[#fafafa]">
        {text}
      </p>
    </div>
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
}: FieldProps) {
  return (
    <>
      <Label text={label} required={required} top={topLabel} left={left} />
      <Box top={topBox} left={left} width={width} placeholder={placeholder} />
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
  return (
    <div className="absolute left-0 top-0" data-name="input">
      <Back />

      {/* Title */}
      <p
        className="absolute left-[863px] top-[200px] text-[40px] font-medium leading-[64px] text-[#3182f6]
                   font-['Noto Sans KR',sans-serif] whitespace-nowrap break-keep"
      >
        회원가입
      </p>

      {/* 아이디 + 중복확인 */}
      <Label text="아이디" required top={274} left={LEFT} />
      <Box top={297} left={LEFT} width={250} placeholder="아이디 입력(6~20자)" />
      <PrimaryButton text="중복확인" top={297} left={1126} width={87} />

      {/* 비밀번호 */}
      <Field
        label="비밀번호"
        required
        topLabel={345}
        topBox={368}
        placeholder="비밀번호 입력 (문자, 숫자, 특수문자 포함 8~20자)"
      />

      {/* 비밀번호 확인 */}
      <Field
        label="비밀번호 확인"
        required
        topLabel={416}
        topBox={439}
        placeholder="비밀번호 재입력"
      />

      {/* 이름 */}
      <Field
        label="이름"
        required
        topLabel={487}
        topBox={510}
        placeholder="이름을 입력해주세요"
      />

      {/* 이메일 + 인증 */}
      <Label text="이메일 주소" required top={558} left={LEFT} />
      <Box top={581} left={LEFT} width={234} placeholder="이메일 주소" />
      <PrimaryButton text="인증번호 발송" top={581} left={1105} width={108} />

      <Box top={622} left={LEFT} width={256} placeholder="인증번호 (6자리 입력)" />
      <PrimaryButton text="인증하기" top={622} left={1126} width={87} />

      {/* 전화번호 */}
      <Field
        label="전화번호"
        topLabel={678}
        topBox={701}
        placeholder="휴대폰 번호 입력 (‘-’제외 11자리 입력)"
      />

      {/* 주소 */}
      <Label text="주소" top={749} left={LEFT} />
      <Box top={772} left={LEFT} width={BOX_W} placeholder="주소를 입력해주세요" />
      <Box top={813} left={LEFT} width={BOX_W} placeholder="상세주소" />

      {/* Sign Up 버튼 */}
      <PrimaryButton text="Sign Up" top={899} left={LEFT} width={350} />

      <TermsText />
    </div>
  );
}

export default function Component052Signup() {
  return (
    // ✅ 데스크탑 전용 캔버스 (1440 고정, 작으면 가로 스크롤)
    <div className="min-h-screen bg-white overflow-x-auto">
      <div className="relative mx-auto h-[1024px] w-[1440px]" data-name="05-2_Signup">
        <Form />

        {/* Left mascot */}
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
