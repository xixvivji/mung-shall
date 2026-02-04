import { motion } from "motion/react";
import { Link } from "react-router-dom";
import Container from "@/shared/components/Container";
import heroBg from "@/assets/images/hero_bg.png";

export default function HeroSection() {
  return (
    <section
      className="
        relative w-full min-h-screen overflow-hidden
        bg-center bg-no-repeat bg-cover
      "
      style={{
        backgroundImage: `url(${heroBg})`,
      }}
    >
      {/* ✅ 글씨 / 버튼 (배경 위) */}
      <Container className="relative z-0 min-h-screen py-24 md:py-32 flex items-center">
        <div className="max-w-[520px] -translate-y-20">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
            className="text-[48px] md:text-[64px] leading-none font-light text-[#bdbdbd]"
          >
            MUNG!
          </motion.p>

          <motion.p
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.7, ease: "easeOut" }}
            className="text-[48px] md:text-[64px] leading-none font-bold text-[#3182f6]"
          >
            SHALL?
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
            className="mt-10"
          >
            <Link
              to="/adoption"
              className="inline-flex items-center gap-3 rounded-xl px-8 py-5 text-[#333] hover:bg-white/60"
            >
              입양하러 가기 <span aria-hidden>→</span>
            </Link>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
