import motionImg from "@/assets/images/mungshall.png";
import { motion } from "motion/react";

export default function MotionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center select-none">
      {/* 기준 컨테이너 */}
      <div className="relative">
        <motion.img
          src={motionImg}
          draggable={false}
          initial={{ opacity: 0, y: 40, x: 0 }}
          animate={{ opacity: 1, y: 0, x: -250 }}
          transition={{
            duration: 1,
            ease: "easeOut",
            x: { delay: 1, duration: 0.8, ease: "easeInOut" },
          }}
          className="mx-auto block"
        />

        {/* 텍스트를 이미지 기준으로 고정 */}
        <div
          className="
            absolute
            left-1/2
            top-[438px]
            -translate-x-1/2
            z-50
            flex flex-col items-start
          "
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
      </div>
    </div>
  );
}
