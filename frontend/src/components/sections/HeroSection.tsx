import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { Container } from "../layout/Container";

export function HeroSection() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  const handleGoAdoption = () => {
    navigate("/adoption");
  };

  const handleScrollDown = () => {
    const el = document.getElementById("introduction");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative overflow-x-hidden">
      <div className="absolute inset-0">
        <img
          src="/hero2.png"
          alt=""
          draggable={false}
          className="h-full w-full object-cover object-[center_75%]"
        />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/90 via-white/35 to-transparent" />
      </div>

      <Container className="relative z-10">
        <div className="flex min-h-[720px] flex-col items-center justify-center pt-24 pb-56 text-center md:min-h-[820px] md:pt-28 md:pb-72">
          {/* ✅ 이 줄 추가: 전체 콘텐츠를 위로 살짝 당김 */}
          <div className="-translate-y-10 md:-translate-y-14">
            <div
              className={[
                "transition-opacity duration-[2000ms] ease-out",
                mounted ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              <h1 className="mb-7 text-4xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-6xl">
                유기견의 모든 것
              </h1>

              <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.03em] md:text-6xl">
                멍쉘에서 쉽고 간편하게
              </h1>
            </div>
            <div
              className={[
                "mt-16 flex flex-col items-center gap-3 sm:flex-row sm:justify-center",
                "transition-opacity duration-[2000ms] ease-out",
                mounted ? "opacity-100" : "opacity-0",
              ].join(" ")}
            >
              <Button size="lg" onClick={handleGoAdoption}>
                입양하러 가기
              </Button>
            </div>
          </div>
        </div>
      </Container>

      <button
        type="button"
        onClick={handleScrollDown}
        aria-label="아래 섹션으로 이동"
        className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-slate-500"
      >
        <span className="inline-block rotate-45 border-b-2 border-r-2 border-slate-400 p-2" />
      </button>
    </section>
  );
}
