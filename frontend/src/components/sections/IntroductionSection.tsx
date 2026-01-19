import { Container } from "../layout/Container";

export function IntroductionSection() {
  return (
    <section id="introduction" className="relative overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/mungshall.png"
          alt=""
          draggable={false}
          className="
            h-full w-full object-cover
            object-[center_75%]
            scale-50
          "
        />
      </div>

      {/* Content */}
      <Container className="relative z-10">
        <div className="min-h-[720px] pt-20 md:min-h-[820px] md:pt-24">
          {/* ✅ 2칸 레이아웃 */}
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            {/* LEFT: 제목 */}
            <div className="text-left">
              <h2 className="text-3xl font-semibold leading-[1.3] tracking-[-0.03em] text-blue-500 md:text-2xl">
                입양
              </h2>

              <h1 className="mt-2 text-4xl font-semibold leading-[1.2] tracking-[-0.03em] md:text-5xl">
                MUNG! SHALL?
              </h1>

              <h1 className="mt-4 text-4xl font-semibold leading-[1.2] tracking-[-0.03em] md:text-5xl">
                입양부터
              </h1>

              <h1 className="mt-4 text-4xl font-semibold leading-[1.2] tracking-[-0.03em] md:text-5xl">
                사후 관리까지
              </h1>
            </div>

            {/* RIGHT: 설명(p) */}
            <div className="flex h-full items-end justify-end">
              <div className="max-w-[380px] text-left">
                <p className="text-[16px] font-medium leading-[1.7] text-slate-700 md:text-[18px]">
                  입양 준비부터 필요한 정보와 체크리스트,
                </p>
                <p className="mt-1 text-[16px] font-medium leading-[1.7] text-slate-700 md:text-[18px]">
                  입양 후 관리까지 한 번에 도와드려요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
