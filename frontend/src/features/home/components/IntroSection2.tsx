type FeatureItem = {
  title: string;
  desc: string;
  icon: JSX.Element;
  accentRing: string;
};

const StageMapIcon = () => (
  <svg viewBox="0 0 120 120" className="h-20 w-20 md:h-24 md:w-24" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="s2_prog_bg" x1="14" y1="12" x2="105" y2="104" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8EC5FF" />
        <stop offset="1" stopColor="#2563EB" />
      </linearGradient>
      <linearGradient id="s2_prog_path" x1="34" y1="78" x2="86" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" stopOpacity="0.8" />
        <stop offset="1" stopColor="#DBEAFE" />
      </linearGradient>
      <linearGradient id="s2_flag" x1="76" y1="30" x2="89" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="1" stopColor="#EA580C" />
      </linearGradient>
    </defs>
    <rect x="14" y="12" width="92" height="92" rx="28" fill="url(#s2_prog_bg)" />
    <ellipse cx="45" cy="30" rx="22" ry="7" fill="#FFFFFF" opacity="0.24" />
    <path d="M32 77c10 0 11-12 21-12s11 12 21 12 11-12 21-12" stroke="url(#s2_prog_path)" strokeWidth="6" strokeLinecap="round" strokeDasharray="7 9" />
    <circle cx="32" cy="77" r="5.5" fill="#DBEAFE" />
    <circle cx="53" cy="65" r="5.5" fill="#BFDBFE" />
    <circle cx="74" cy="77" r="5.5" fill="#93C5FD" />
    <rect x="79" y="34" width="4.5" height="24" rx="2.2" fill="#F8FAFC" />
    <path d="M83 34h13l-5.5 6L96 46H83z" fill="url(#s2_flag)" />
  </svg>
);

const DocLaunchIcon = () => (
  <svg viewBox="0 0 120 120" className="h-20 w-20 md:h-24 md:w-24" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="s2_doc_bg" x1="20" y1="14" x2="100" y2="104" gradientUnits="userSpaceOnUse">
        <stop stopColor="#A78BFA" />
        <stop offset="1" stopColor="#4F46E5" />
      </linearGradient>
      <linearGradient id="s2_doc_sheet" x1="35" y1="29" x2="80" y2="86" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#EEF2FF" />
      </linearGradient>
    </defs>
    <rect x="18" y="14" width="84" height="92" rx="26" fill="url(#s2_doc_bg)" />
    <ellipse cx="46" cy="30" rx="21" ry="7" fill="#FFFFFF" opacity="0.24" />
    <path d="M42 31h18l14 14v34a8 8 0 0 1-8 8H42a8 8 0 0 1-8-8V39a8 8 0 0 1 8-8z" fill="url(#s2_doc_sheet)" />
    <path d="M60 31v14h14" fill="#E2E8F0" />
    <path d="M54 70V53" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round" />
    <path d="M46 59l8-8 8 8" stroke="#4F46E5" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="47" y="72.5" width="22" height="4.5" rx="2.2" fill="#818CF8" />
  </svg>
);

const FlowHistoryIcon = () => (
  <svg viewBox="0 0 120 120" className="h-20 w-20 md:h-24 md:w-24" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="s2_hist_bg" x1="18" y1="18" x2="95" y2="101" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FCA5A5" />
        <stop offset="1" stopColor="#EF4444" />
      </linearGradient>
      <linearGradient id="s2_hist_paper" x1="37" y1="35" x2="80" y2="84" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FFFFFF" />
        <stop offset="1" stopColor="#FEE2E2" />
      </linearGradient>
    </defs>
    <rect x="18" y="18" width="84" height="84" rx="26" fill="url(#s2_hist_bg)" />
    <ellipse cx="44" cy="34" rx="20" ry="7" fill="#FFFFFF" opacity="0.22" />
    <rect x="35" y="32" width="50" height="58" rx="12" fill="url(#s2_hist_paper)" />
    <rect x="46" y="26" width="28" height="10" rx="5" fill="#FECACA" />
    <path d="M45 54h22M45 64h14" stroke="#DC2626" strokeWidth="4.2" strokeLinecap="round" />
    <circle cx="68" cy="69" r="11" fill="#FCA5A5" />
    <path d="M68 64v6l4 3" stroke="#991B1B" strokeWidth="3.8" strokeLinecap="round" />
  </svg>
);

const CompassGuideIcon = () => (
  <svg viewBox="0 0 120 120" className="h-20 w-20 md:h-24 md:w-24" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="s2_guide_bg" x1="18" y1="14" x2="104" y2="103" gradientUnits="userSpaceOnUse">
        <stop stopColor="#93C5FD" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    <rect x="16" y="14" width="88" height="88" rx="28" fill="url(#s2_guide_bg)" />
    <ellipse cx="47" cy="31" rx="20" ry="6.5" fill="#FFFFFF" opacity="0.24" />
    <path d="M36 76V42l23 8 23-8v34l-10-6-13 6-13-6-10 6z" fill="#F8FAFC" />
    <path d="M59 50v26" stroke="#BFDBFE" strokeWidth="3.2" />
    <path d="M44 58h9M64 58h9" stroke="#60A5FA" strokeWidth="3.6" strokeLinecap="round" />
    <circle cx="59" cy="63" r="4.8" fill="#2563EB" />
  </svg>
);

const FEATURES: FeatureItem[] = [
  {
    title: "내 입양 진행도",
    desc: "언제 어디서든 현재 단계, 남은 준비 항목, 다음 할 일을 한 곳에서 빠르게 확인할 수 있어요.",
    icon: <StageMapIcon />,
    accentRing: "ring-blue-100",
  },
  {
    title: "서류 빠른 제출",
    desc: "필요 서류를 단계별로 안내받고 누락 없이 업로드해, 심사 지연을 줄이고 진행 속도를 높여요.",
    icon: <DocLaunchIcon />,
    accentRing: "ring-indigo-100",
  },
  {
    title: "진행 이력 기록",
    desc: "단계별 진행 내역과 완료 기록을 자동으로 남겨, 현재 위치와 다음 순서를 한눈에 파악할 수 있어요.",
    icon: <FlowHistoryIcon />,
    accentRing: "ring-sky-100",
  },
  {
    title: "입양 준비 가이드",
    desc: "초기 적응부터 사후 관리까지 상황에 맞는 체크포인트와 팁을 제공해 더 안정적으로 정착할 수 있어요.",
    icon: <CompassGuideIcon />,
    accentRing: "ring-blue-100",
  },
];

export default function IntroSection2() {
  return (
    <section className="snap-start snap-always min-h-screen w-full bg-gradient-to-b from-white via-slate-50/70 to-slate-100/60">
      <div className="mx-auto max-w-[1080px] px-6 py-20 md:py-28">
        <h2 className="mt-2.5 text-[32px] md:text-[44px] font-extrabold leading-[1.22] tracking-[-0.02em] text-slate-900">
          입양 과정
          <br />
          한 화면에서 끝까지
        </h2>

        <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-14 md:gap-y-16">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="group max-w-[430px]">
              <div
                className={`inline-flex h-[108px] w-[108px] md:h-[124px] md:w-[124px] items-center justify-center rounded-[30px] bg-white ring-1 ${feature.accentRing} shadow-[0_12px_26px_rgba(15,23,42,0.08)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-[-1deg]`}
              >
                {feature.icon}
              </div>
              <h3 className="mt-4 text-[25px] md:text-[29px] font-extrabold leading-[1.28] tracking-[-0.015em] text-slate-900">
                {feature.title}
              </h3>
              <p className="mt-2.5 text-[15px] md:text-[16px] leading-[1.72] tracking-[-0.005em] text-slate-600">
                {feature.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
