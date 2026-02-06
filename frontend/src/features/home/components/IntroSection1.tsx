import kimMungshall from "@/assets/images/김멍쉘.png";

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

  character: "w-[260px] md:w-[500px]",
};

/* =======================
   POSITION CONTROL (atomic)
   - % 기준이 "컨테이너(1200px)"가 되도록 그룹을 inset-0로 만든다
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

  // Character
  character: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
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
   - inset-0로 "컨테이너 전체"를 덮게 해서 % 기준이 정상화됨
   - 내부에 relative를 둬서 나중에 그룹 애니메이션(translate 등) 붙이기 쉬움
======================= */
const GROUPS = {
  mungOuter: "absolute inset-0 z-10 select-none pointer-events-none",
  shallOuter: "absolute inset-0 z-30 select-none pointer-events-none",

  // 여기에 나중에 그룹 단위 이동/페이드 클래스를 붙이면 됨
  mungInner: "relative w-full h-full",
  shallInner: "relative w-full h-full",
};

/* =======================
   ANIM placeholder
======================= */
const ANIM = {
  mungGroup: "", // ex) "translate-y-[20px] opacity-0"
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
            <div className={`absolute ${POSITIONS.mungBottomDesc} -translate-y-1/2`}>
              <div className={`${SIZES.mungDescBottom} ${COLORS.mung.desc}`}>
                에서 시작해,
              </div>
            </div>
          </div>
        </div>

        {/* =======================
            CHARACTER
        ======================= */}
        <div
          className={`absolute z-20 ${POSITIONS.character} select-none`}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
        >
          <img
            src={kimMungshall}
            alt="김멍쉘"
            className={`${SIZES.character} object-contain pointer-events-none`}
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
