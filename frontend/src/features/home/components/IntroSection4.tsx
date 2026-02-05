import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";

const mockCards = ["#FAD1D5", "#F8D7A8", "#C7EDE6", "#D9D2F9", "#FFE4B5"];

export default function IntroSection4() {
  const items = [...mockCards, ...mockCards];

  return (
    <section className="w-full bg-white py-28">
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <h2 className="text-4xl font-semibold text-[#111]">
          새로운 가족을 만나러 가볼까요?
        </h2>

        <div className="mt-20 mb-40">
          <Link
            to={ROUTES.adoption}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            입양하러 가기
          </Link>
        </div>

        <div className="relative mt-16 overflow-hidden py-8 mb-50">
          <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-28 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-28 bg-gradient-to-l from-white to-transparent" />

          <div className="flex w-max items-center animate-slide-left gap-8">
            {items.map((color, idx) => (
              <div
                key={`${color}-${idx}`}
                className="relative z-0 h-[260px] w-[180px] flex-shrink-0 rounded-3xl transition-transform duration-300 ease-out hover:z-10 hover:scale-105"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
