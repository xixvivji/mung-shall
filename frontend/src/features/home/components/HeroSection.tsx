import motionImg from "@/assets/images/mungshall.png";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  // ✅ 여기 숫자만 바꾸면 각각 위치 따로 조절됨
  const textPos = { left: -500, top: 0 };     // 텍스트 위치
  const buttonPos = { left: 500, top: 200 };   // 버튼 위치

  return (
    <section className="min-h-screen flex items-center justify-center select-none bg-white">
      {/* 기준 컨테이너(이미지 기준 좌표계) */}
      <div className="relative">
        <motion.img
          src={motionImg}
          draggable={false}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -100 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mx-auto block"
          alt="mungshall"
        />

        {/* ✅ 텍스트 오버레이 */}
        <div
          className="absolute left-1/2 top-1/2 z-50"
          style={{
            transform: `translate(-50%, -50%) translate(${textPos.left}px, ${textPos.top}px)`,
          }}
        >
          <motion.p
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 2000, damping: 20 }}
            className="text-[48px] md:text-[64px] leading-none font-light text-[#bdbdbd]"
          >
            MUNG!
          </motion.p>

          <motion.p
            initial={{ opacity: 0, x: -220 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5, duration: 0.9, ease: "easeOut" }}
            className="text-[48px] md:text-[64px] leading-none font-bold text-[#3182f6]"
          >
            SHALL?
          </motion.p>
        </div>

        {/* ✅ 버튼 오버레이 */}
        <div
          className="absolute left-1/2 top-1/2 z-50"
          style={{
            transform: `translate(-50%, -50%) translate(${buttonPos.left}px, ${buttonPos.top}px)`,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1, duration: 0.5, ease: "easeOut" }}
          >
            <Link
              to="/adoption"
              className="
                inline-flex items-center gap-3
                px-8 py-5
                text-[#333]
                hover:bg-gray-50
              "
            >
              입양하러 가기 <span aria-hidden>→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
