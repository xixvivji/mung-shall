import { useMemo, useState } from "react";
import {
  CenterProfileSection,
  CenterDogsSection,
  CenterApplicationsSection,
  CenterConsultSection,
} from "../../features/center";

type TabKey = "dogs" | "applications" | "consult";

export default function CenterPage() {
  const [active, setActive] = useState<TabKey>("dogs");

  const tabs = useMemo(
    () => [
      { key: "dogs" as const, label: "보호 중인 강아지" },
      { key: "applications" as const, label: "입양 신청" },
      { key: "consult" as const, label: "화상 상담 예약" },
    ],
    []
  );

  const tabBase =
    "px-3 py-2 text-sm rounded-xl transition-colors duration-150 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111]/25 focus-visible:ring-offset-2";
  const tabActive = "bg-black text-white border-black shadow-sm";
  const tabIdle = "bg-white text-slate-700 border-slate-200 hover:bg-slate-50";

  return (
    <div className="min-h-screen bg-[#F7F8FB]">
      <h1 className="text-[33px] font-bold tracking-tight text-[#333] mt-10">
        센터 페이지
      </h1>
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* 0. 센터 프로필(표시/수정) */}
        <CenterProfileSection />

        {/* 탭 버튼 */}
        <div className="sticky top-0 z-30 -mx-4 mt-6 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={[tabBase, active === t.key ? tabActive : tabIdle].join(" ")}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ 탭 내용: active에 따라 하나만 렌더링 */}
        <div className="pt-8 pb-16">
          {active === "dogs" && <CenterDogsSection />}
          {active === "applications" && <CenterApplicationsSection />}
          {active === "consult" && <CenterConsultSection />}
        </div>
      </div>
    </div>
  );
}
