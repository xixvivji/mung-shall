import kimMungshall from "@/assets/images/김멍쉘.png";

export default function IntroSection2() {
  return (
    <section className="snap-start snap-always min-h-screen w-full bg-white">
      <div className="relative mx-auto max-w-[1200px] px-6 min-h-screen">
        {/* 좌측 상단 타이틀 */}
        <div className="absolute left-[140px] top-[220px]">
          <h2 className="text-[28px] font-semibold leading-[1.25] text-[#111827]">
            간편한
            <br />
            입양 관리 시스템
          </h2>
        </div>

        {/* 중앙 캐릭터 */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[52%]">
          <img
            src={kimMungshall}
            alt="김멍쉘"
            className="w-[260px] md:w-[320px] object-contain"
            draggable={false}
          />
        </div>

        {/* 우측 하단 설명 */}
        <div className="absolute right-[150px] top-[520px] w-[320px]">
          <h3 className="text-[26px] font-semibold leading-[1.25] text-[#111827]">
            가나다라
            <br />
            마바사아자
          </h3>

          <p className="mt-4 text-sm leading-6 text-[#6B7280]">
            설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명하고,
            <br />
            설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명 설명이다.
          </p>
        </div>
      </div>
    </section>
  );
}
