import kimMungshall from "@/assets/images/김멍쉘.png";

/* =======================
   SIZE CONTROL
======================= */
const SIZES = {
  mungText: "text-[110px] md:text-[170px]",
  mungDesc: "text-lg",

  shallText: "text-[84px] md:text-[170px]",
  shallDesc: "text-lg",

  character: "w-[260px] md:w-[500px]",
};

/* =======================
   POSITION CONTROL
   (absolute + top/left + translate)
======================= */
const POSITIONS = {
  mungText: "left-[0%] top-[40%] -translate-y-1/2",
  mungDesc: "left-[10%] top-[51%] -translate-y-1/2",

  shallText: "left-[52%] top-[50%] -translate-y-1/2",
  shallDesc: "left-[70%] top-[61%] -translate-y-1/2",

  character: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
};

export default function IntroSection1() {
  return (
    <section className="snap-start snap-always min-h-screen w-full bg-white">
      <div className="relative mx-auto max-w-[1200px] px-6 min-h-screen flex items-center">

        {/* ===== MUNG TEXT ===== */}
        <div className={`absolute z-10 select-none pointer-events-none ${POSITIONS.mungText}`}>
          <div className={`${SIZES.mungText} font-light tracking-tight text-[#D1D5DB] leading-none`}>
            MUNG
          </div>
        </div>

        {/* ===== MUNG DESC ===== */}
        <div className={`absolute z-10 select-none pointer-events-none ${POSITIONS.mungDesc}`}>
          <div className={`${SIZES.mungDesc} text-[#D1D5DB]`}>
            강아지가 짖는 소리를 표현
          </div>
        </div>

        {/* ===== CHARACTER ===== */}
        <div className={`absolute z-20 ${POSITIONS.character}`}>
          <img
            src={kimMungshall}
            alt="김멍쉘"
            className={`${SIZES.character} object-contain`}
            draggable={false}
          />
        </div>

        {/* ===== SHALL TEXT ===== */}
        <div className={`absolute z-30 select-none pointer-events-none text-right ${POSITIONS.shallText}`}>
          <div
            className={`
              ${SIZES.shallText}
              font-extrabold tracking-tight leading-none
              text-[#2563EB]
            `}
          >
            SHALL
          </div>
        </div>

        {/* ===== SHALL DESC ===== */}
        <div className={`absolute z-30 select-none pointer-events-none text-right ${POSITIONS.shallDesc}`}>
          <div className={`${SIZES.shallDesc} text-[#60A5FA]`}>
            입양을 권하는 청유형
          </div>
        </div>

      </div>
    </section>
  );
}
