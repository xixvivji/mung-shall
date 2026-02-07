import { motion, useInView } from "framer-motion";
import { useRef } from "react";
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
======================= */
const GROUPS = {
  mungOuter: "absolute inset-0 z-10 select-none pointer-events-none",
  shallOuter: "absolute inset-0 z-30 select-none pointer-events-none",
  mungInner: "relative w-full h-full",
  shallInner: "relative w-full h-full",
};

/* =======================
   MOTION
   - 섹션이 화면에 들어올 때만 재생
   - once: true 로 1회만 재생
======================= */
const ease = [0.22, 1, 0.36, 1] as const;

const leftGroupVariants = {
  hidden: { opacity: 0, x: -40, filter: "blur(6px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease, when: "beforeChildren", staggerChildren: 0.12 },
  },
};

const rightGroupVariants = {
  hidden: { opacity: 0, x: 40, filter: "blur(6px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.85,
      ease,
      delay: 0.45, // ✅ 왼쪽 다음
      when: "beforeChildren",
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

export default function IntroSection1() {
  // ✅ 섹션이 뷰포트에 들어오면 true (한 번만)
  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.45 });

  return (
    <section ref={sectionRef} className="snap-start snap-always min-h-screen w-full bg-white">
      <div className="relative mx-auto max-w-[1200px] px-6 min-h-screen flex items-center">
        {/* =======================
            MUNG GROUP (LEFT) - 먼저
        ======================= */}
        <motion.div
          className={GROUPS.mungOuter}
          variants={leftGroupVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          <div className={GROUPS.mungInner}>
            {/* Top Desc */}
            <motion.div
              variants={itemVariants}
              className={`absolute ${POSITIONS.mungTopDesc} -translate-y-1/2`}
            >
              <div className={`${SIZES.mungDescTop} ${COLORS.mung.desc}`}>유기견의</div>
            </motion.div>

            {/* Title */}
            <motion.div
              variants={itemVariants}
              className={`absolute ${POSITIONS.mungTitle} -translate-y-1/2`}
            >
              <div
                className={`${SIZES.mungTitle} font-light tracking-tight ${COLORS.mung.title}`}
              >
                MUNG
              </div>
            </motion.div>

            {/* Bottom Desc */}
            <motion.div
              variants={itemVariants}
              className={`absolute ${POSITIONS.mungBottomDesc} -translate-y-1/2`}
            >
              <div className={`${SIZES.mungDescBottom} ${COLORS.mung.desc}`}>에서 시작해,</div>
            </motion.div>
          </div>
        </motion.div>

        {/* =======================
            CHARACTER (중앙)
            - 섹션 들어오면 페이드/스케일 (한 번)
        ======================= */}
        <motion.div
          className={`absolute z-20 ${POSITIONS.character} select-none`}
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
        >
          <img
            src={kimMungshall}
            alt="김멍쉘"
            className={`${SIZES.character} object-contain pointer-events-none`}
            draggable={false}
          />
        </motion.div>

        {/* =======================
            SHALL GROUP (RIGHT) - 나중
        ======================= */}
        <motion.div
          className={GROUPS.shallOuter}
          variants={rightGroupVariants}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
        >
          <div className={GROUPS.shallInner}>
            {/* Top Desc */}
            <motion.div
              variants={itemVariants}
              className={`absolute ${POSITIONS.shallTopDesc} -translate-y-1/2 text-right`}
            >
              <div className={`${SIZES.shallDescTop} ${COLORS.shall.desc}`}>함께하는 의미</div>
            </motion.div>

            {/* Title */}
            <motion.div
              variants={itemVariants}
              className={`absolute ${POSITIONS.shallTitle} -translate-y-1/2 text-right`}
            >
              <div
                className={`${SIZES.shallTitle} font-extrabold tracking-tight ${COLORS.shall.title}`}
              >
                SHALL
              </div>
            </motion.div>

            {/* Bottom Desc */}
            <motion.div
              variants={itemVariants}
              className={`absolute ${POSITIONS.shallBottomDesc} -translate-y-1/2 text-right`}
            >
              <div className={`${SIZES.shallDescBottom} ${COLORS.shall.desc}`}>로 이어집니다</div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
