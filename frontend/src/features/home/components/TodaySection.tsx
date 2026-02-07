import { useEffect, useRef, useState } from "react";
import { motion, animate, useInView, useMotionValue, useTransform } from "motion/react";
import { getTodayStatusCounts } from "../api/todayApi";
import Container from "@/shared/components/Container"; // 경로는 맞춰줘

type TodayStats = { 보호중: number; 입양: number; 안락사: number; };

const INITIAL: TodayStats = { 보호중: 0, 입양: 0, 안락사: 0 };

export default function TodaySection() {
  const [stats, setStats] = useState<TodayStats>(INITIAL);

  const sectionRef = useRef<HTMLElement | null>(null);
  const inView = useInView(sectionRef, { amount: 0.35, once: true });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTodayStatusCounts();
        const next = { ...INITIAL };

        res.forEach(({ status, count }) => {
          if (status === "보호중") next.보호중 = count;
          if (status === "종료(입양)") next.입양 = count;
          if (status === "종료(안락사)") next.안락사 = count;
        });

        setStats(next);
      } catch (e) {
        console.error("Today stats fetch failed", e);
      }
    };

    fetch();
  }, []);

  return (
    <section ref={sectionRef} className="w-full bg-white">
      <Container className="py-24 md:py-28">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center text-[56px] md:text-[64px] font-medium text-[#bdbdbd]"
        >
          Today
        </motion.h2>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
          <Stat label="보호중" value={stats.보호중} color="text-[#4598ff]" delay={0.3} play={inView} />
          <Stat label="입양" value={stats.입양} color="text-[#4598ff]" delay={0.6} play={inView} />
          <Stat label="안락사" value={stats.안락사} color="text-[#bcbacd]" delay={0.9} play={inView} />
        </div>
      </Container>
    </section>
  );
}

function Stat({
  label,
  value,
  color,
  delay,
  play,
}: {
  label: string;
  value: number;
  color: string;
  delay: number;
  play: boolean;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    if (!play) return;
    const controls = animate(count, value, { delay, duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [play, value, delay, count]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={play ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className="text-center"
    >
      <motion.p className={`text-[44px] font-bold ${color}`}>{rounded}</motion.p>
      <p className="text-[24px] font-medium text-[rgba(69,152,255,0.5)]">{label}</p>
    </motion.div>
  );
}
