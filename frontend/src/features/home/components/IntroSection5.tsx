type PrepItem = {
  title: string;
  desc: string;
  icon: JSX.Element;
  accentRing: string;
};

const ClarityLensIcon = () => (
  <svg viewBox="0 0 120 120" className="h-20 w-20 md:h-24 md:w-24" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="s5_lens_bg" x1="18" y1="16" x2="100" y2="102" gradientUnits="userSpaceOnUse">
        <stop stopColor="#67E8F9" />
        <stop offset="1" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient id="s5_lens_glass" x1="38" y1="34" x2="67" y2="66" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" stopOpacity="0.9" />
        <stop offset="1" stopColor="#E0F2FE" stopOpacity="0.7" />
      </linearGradient>
    </defs>
    <rect x="18" y="16" width="84" height="88" rx="26" fill="url(#s5_lens_bg)" />
    <ellipse cx="42" cy="33" rx="18" ry="6" fill="#FFFFFF" opacity="0.2" />
    <rect x="31" y="36" width="34" height="44" rx="8" fill="#F8FAFC" />
    <path d="M37 49h16M37 58h11M37 67h8" stroke="#0EA5E9" strokeWidth="3.8" strokeLinecap="round" />
    <circle cx="70" cy="64" r="14" fill="url(#s5_lens_glass)" />
    <circle cx="70" cy="64" r="9" stroke="#0369A1" strokeWidth="3.5" />
    <rect x="78" y="76" width="18" height="8" rx="4" transform="rotate(38 78 76)" fill="#075985" />
  </svg>
);

const LinkTrustIcon = () => (
  <svg viewBox="0 0 120 120" className="h-20 w-20 md:h-24 md:w-24" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="s5_trust_bg" x1="18" y1="14" x2="103" y2="104" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBCFE8" />
        <stop offset="1" stopColor="#DB2777" />
      </linearGradient>
      <linearGradient id="s5_trust_doc" x1="40" y1="33" x2="79" y2="84" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#FCE7F3" />
      </linearGradient>
    </defs>
    <rect x="18" y="14" width="84" height="92" rx="26" fill="url(#s5_trust_bg)" />
    <ellipse cx="44" cy="30" rx="19" ry="6.5" fill="#FFFFFF" opacity="0.24" />
    <path d="M42 31h16l13 13v33a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8V39a8 8 0 0 1 8-8z" fill="url(#s5_trust_doc)" />
    <path d="M58 31v13h13" fill="#FBCFE8" />
    <rect x="44" y="53" width="19" height="4.2" rx="2.1" fill="#BE185D" />
    <rect x="44" y="61" width="14" height="4.2" rx="2.1" fill="#BE185D" opacity="0.9" />
    <circle cx="73" cy="66" r="10" fill="#F9A8D4" />
    <path d="M73 60v6l4 3" stroke="#831843" strokeWidth="3.5" strokeLinecap="round" />
  </svg>
);

const ShieldCareIcon = () => (
  <svg viewBox="0 0 120 120" className="h-20 w-20 md:h-24 md:w-24" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="s5_shield_bg" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(70 35) rotate(135) scale(66)">
        <stop stopColor="#D9F99D" />
        <stop offset="1" stopColor="#84CC16" />
      </radialGradient>
    </defs>
    <circle cx="60" cy="52" r="32" fill="url(#s5_shield_bg)" />
    <path d="M60 30l17 6v13c0 11-7 19-17 24-10-5-17-13-17-24V36l17-6z" fill="#F7FEE7" />
    <path d="M52 50l6 6 11-12" stroke="#3F6212" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="56" y="78" width="8" height="24" rx="4" fill="#CA8A04" />
    <ellipse cx="45" cy="34" rx="12" ry="6" fill="#FFFFFF" opacity="0.24" />
  </svg>
);

const RouteGuideIcon = () => (
  <svg viewBox="0 0 120 120" className="h-20 w-20 md:h-24 md:w-24" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="s5_guide_bg" x1="16" y1="16" x2="102" y2="104" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA" />
        <stop offset="1" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
    <rect x="16" y="14" width="88" height="88" rx="28" fill="url(#s5_guide_bg)" />
    <path d="M39 75V39h42v36l-10-6-11 6-11-6-10 6z" fill="#F8FAFC" />
    <path d="M48 48h24M48 56h17" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" />
    <ellipse cx="49" cy="32" rx="18" ry="6" fill="#FFFFFF" opacity="0.23" />
  </svg>
);

const PREP_ITEMS: PrepItem[] = [
  {
    title: "불확실성 줄이기",
    desc: "상태 일정과 준비물을 단계별로 정리해, 지금 무엇을 해야 하는지 바로 파악할 수 있어요.",
    icon: <ClarityLensIcon />,
    accentRing: "ring-sky-100",
  },
  {
    title: "신뢰를 쌓는 기록",
    desc: "진행 이력과 제출 문서를 한곳에 남겨, 보호소와 입양자가 같은 정보를 투명하게 공유해요.",
    icon: <LinkTrustIcon />,
    accentRing: "ring-blue-100",
  },
  {
    title: "입양을 책임감 있게",
    desc: "입양 후 적응 상태를 꾸준히 확인하고 필요한 케어를 이어가며 재파양 위험을 낮출 수 있어요.",
    icon: <ShieldCareIcon />,
    accentRing: "ring-indigo-100",
  },
  {
    title: "입양 준비 가이드",
    desc: "초기 환경 세팅부터 생활 루틴까지, 꼭 필요한 체크포인트를 따라 안정적으로 준비할 수 있어요.",
    icon: <RouteGuideIcon />,
    accentRing: "ring-violet-100",
  },
];

export default function IntroSection5() {
  return (
    <section className="snap-start snap-always min-h-screen w-full bg-gradient-to-b from-white via-slate-50/70 to-slate-100/60">
      <div className="mx-auto max-w-[1080px] px-6 py-20 md:py-28">
        <h2 className="mt-2.5 text-[32px] md:text-[44px] font-extrabold leading-[1.22] tracking-[-0.02em] text-slate-900">
          함께할 준비
          <br />
          멍쉘이 돕습니다
        </h2>

        <div className="mt-14 md:mt-20 w-full md:w-fit mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-x-16 md:gap-y-14 justify-items-center">
          {PREP_ITEMS.map((item) => (
            <article key={item.title} className="group w-full max-w-[420px]">
              <div
                className={`inline-flex h-[108px] w-[108px] md:h-[124px] md:w-[124px] items-center justify-center rounded-[30px] bg-white ring-1 ${item.accentRing} shadow-[0_12px_26px_rgba(15,23,42,0.08)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-[1deg]`}
              >
                {item.icon}
              </div>
              <h3 className="mt-4 text-[25px] md:text-[29px] font-extrabold leading-[1.28] tracking-[-0.015em] text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2.5 text-[15px] md:text-[16px] leading-[1.72] tracking-[-0.005em] text-slate-600">
                {item.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
