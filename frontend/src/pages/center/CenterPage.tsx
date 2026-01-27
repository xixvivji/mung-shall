import { useMemo, useRef, useState } from "react";
import {
  CenterProfileSection,
  CenterDogsSection,
  CenterApplicationsSection,
  CenterConsultSection,
} from "../../features/center";

type TabKey = "dogs" | "applications" | "consult";

export default function CenterPage() {
  const [active, setActive] = useState<TabKey>("dogs");

  // 섹션 ref
  const dogsRef = useRef<HTMLElement | null>(null);
  const appsRef = useRef<HTMLElement | null>(null);
  const consultRef = useRef<HTMLElement | null>(null);

  const tabs = useMemo(
    () => [
      { key: "dogs" as const, label: "보호중인 강아지", ref: dogsRef },
      { key: "applications" as const, label: "신청 서류", ref: appsRef },
      { key: "consult" as const, label: "화상 상담 예약", ref: consultRef },
    ],
    []
  );

  const scrollTo = (key: TabKey) => {
    setActive(key);
    const target = tabs.find((t) => t.key === key)?.ref.current;
    if (!target) return;

    // sticky 탭 높이만큼 오프셋 주려면 scroll-margin-top 사용(아래 섹션에 클래스)
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const tabBase =
    "px-3 py-2 text-sm rounded-xl transition border";
  const tabActive =
    "bg-black text-white border-black";
  const tabIdle =
    "bg-white text-slate-700 border-slate-200 hover:bg-slate-50";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {/* 0. 센터 프로필(표시/수정) */}
        <CenterProfileSection />

        {/* 1~3 탭(선택 시 스크롤 이동) */}
        <div className="sticky top-0 z-30 -mx-4 mt-6 border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => scrollTo(t.key)}
                className={[
                  tabBase,
                  active === t.key ? tabActive : tabIdle,
                ].join(" ")}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 섹션들 */}
        <section
          ref={(el) => (dogsRef.current = el)}
          className="scroll-mt-24 pt-8"
        >
          <CenterDogsSection />
        </section>

        <section
          ref={(el) => (appsRef.current = el)}
          className="scroll-mt-24 pt-10"
        >
          <CenterApplicationsSection />
        </section>

        <section
          ref={(el) => (consultRef.current = el)}
          className="scroll-mt-24 pt-10 pb-16"
        >
          <CenterConsultSection />
        </section>
      </div>
    </div>
  );
}
