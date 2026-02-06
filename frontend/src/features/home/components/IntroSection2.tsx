import kimMungshall from "@/assets/images/김멍쉘.png";
import Mungshall from "@/assets/images/mungshall.png";

/* =======================
   SIZE CONTROL
======================= */
const SIZES = {
  mungTitle: "text-[110px] md:text-[170px]",
  mungDescTop: "text-[30px] font-semibold",
  mungDescBottom: "text-[30px] font-semibold",

  shallTitle: "text-[84px] md:text-[170px]",
  shallDescTop: "text-[30px] font-semibold",
  shallDescBottom: "text-[30px] font-semibold",

  characterMain: "w-[260px] md:w-[500px]", // 김멍쉘
  characterSub: "w-[200px] md:w-[600px]", // mungshall
};

/* =======================
   POSITION CONTROL (atomic)
======================= */
const POSITIONS = {
  // MUNG (LEFT)
  mungTopDesc: "left-[1%] top-[38%]",
  mungTitle: "left-[0%] top-[44%]",
  mungBottomDesc: "left-[25%] top-[52%]",

  // SHALL (RIGHT)
  shallTopDesc: "left-[60%] top-[46%]",
  shallTitle: "left-[52%] top-[52%]",
  shallBottomDesc: "left-[79%] top-[60%]",

  // Characters
  characterMain: "left-2/3 top-1/2 -translate-x-1/2 -translate-y-1/2",
  characterSub: "left-1/3 top-[42%] -translate-x-1/2",
};

/* =======================
   STYLE TOKENS
======================= */
const COLORS = {
  mung: {
    title: "text-[#D1D5DB]",
    desc: "text-[#D1D5DB]",
  },
  shall: {
    title: "text-[#2563EB]",
    desc: "text-[#60A5FA]",
  },
};

/* =======================
   GROUP WRAPPERS
======================= */
const GROUPS = {
  mungOuter: "absolute inset-0 z-10 select-none pointer-events-none",
  shallOuter: "absolute inset-0 z-30 select-none pointer-events-none",

  mungInner: "relative w-full h-full",
  shallInner: "relative w-full h-full",
};

/* =======================
   ANIM placeholder
======================= */
const ANIM = {
  mungGroup: "",
  shallGroup: "",
};

export default function IntroSection1() {
  return (
    <section className="snap-start snap-always min-h-screen w-full bg-white">
      <div className="relative mx-auto max-w-[1200px] px-6 min-h-screen flex items-center">
        {/* =======================
            MUNG GROUP (LEFT)
        ======================= */}
        <div className={GROUPS.mungOuter}>
          <div className={`${GROUPS.mungInner} ${ANIM.mungGroup}`}>
            {/* Top Desc */}
            <div className={`absolute ${POSITIONS.mungTopDesc} -translate-y-1/2`}>
              <div className={`${SIZES.mungDescTop} ${COLORS.mung.desc}`}>
                유기견의
              </div>
            </div>

            {/* Title */}
            <div className={`absolute ${POSITIONS.mungTitle} -translate-y-1/2`}>
              <div
                className={`${SIZES.mungTitle} font-light tracking-tight ${COLORS.mung.title}`}
              >
                MUNG
              </div>
            </div>

            {/* Bottom Desc */}
            <div
              className={`absolute ${POSITIONS.mungBottomDesc} -translate-y-1/2`}
            >
              <div className={`${SIZES.mungDescBottom} ${COLORS.mung.desc}`}>
                에서 시작해,
              </div>
            </div>
          </div>
        </div>

        {/* =======================
            CHARACTERS
        ======================= */}

        {/* Sub character : mungshall (뒤/보조) */}
        <div
          className={`absolute z-10 ${POSITIONS.characterSub} select-none pointer-events-none`}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        >
          <img
            src={Mungshall}
            alt="멍쉘 캐릭터"
            className={`${SIZES.characterSub} object-contain opacity-80`}
            draggable={false}
          />
        </div>

        {/* Main character : 김멍쉘 (중앙) */}
        <div
          className={`absolute z-20 ${POSITIONS.characterMain} select-none`}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        >
          <img
            src={kimMungshall}
            alt="김멍쉘"
            className={`${SIZES.characterMain} object-contain pointer-events-none`}
            draggable={false}
          />
        </div>

        {/* =======================
            SHALL GROUP (RIGHT)
        ======================= */}
        <div className={GROUPS.shallOuter}>
          <div className={`${GROUPS.shallInner} ${ANIM.shallGroup}`}>
            {/* Top Desc */}
            <div
              className={`absolute ${POSITIONS.shallTopDesc} -translate-y-1/2 text-right`}
            >
              <div className={`${SIZES.shallDescTop} ${COLORS.shall.desc}`}>
                함께하는 의미
              </div>
            </div>

            {/* Title */}
            <div
              className={`absolute ${POSITIONS.shallTitle} -translate-y-1/2 text-right`}
            >
              <div
                className={`${SIZES.shallTitle} font-extrabold tracking-tight ${COLORS.shall.title}`}
              >
                SHALL
              </div>
            </div>

            {/* Bottom Desc */}
            <div
              className={`absolute ${POSITIONS.shallBottomDesc} -translate-y-1/2 text-right`}
            >
              <div className={`${SIZES.shallDescBottom} ${COLORS.shall.desc}`}>
                로 이어집니다
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
