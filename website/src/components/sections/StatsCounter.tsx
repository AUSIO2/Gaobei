"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface StatItemProps {
  prefix?: string;
  value: number;
  suffix?: string;
  label: string;
  sublabel: string;
  duration?: number;
}

function Counter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!isInView) return;
    
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalMs = duration * 1000;
    const startTime = performance.now();

    let animationFrameId: number;

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalMs, 1);
      
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      
      setCount(Math.floor(easeProgress * (end - start) + start));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(updateNumber);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isInView, value, duration]);

  return <span ref={ref} className="font-mono">{count}</span>;
}

function StatItem({ prefix = "", value, suffix = "", label, sublabel, duration = 1.5 }: StatItemProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 border-r border-white/5 last:border-0 md:border-r md:last:border-0 max-md:even:border-r-0 max-md:nth-2:border-r-0">
      <div className="flex items-baseline text-4xl sm:text-5xl md:text-6xl font-black text-white mb-3 tracking-tight">
        {prefix && <span className="text-2xl sm:text-3xl md:text-4xl text-blue-400 mr-0.5">{prefix}</span>}
        <Counter value={value} duration={duration} />
        {suffix && <span className="text-2xl sm:text-3xl md:text-4xl text-blue-400 ml-1">{suffix}</span>}
      </div>
      <div className="text-sm sm:text-base font-bold text-neutral-200 mb-1">
        {label}
      </div>
      <div className="text-xs text-neutral-400 font-light">
        {sublabel}
      </div>
    </div>
  );
}

export default function StatsCounter() {
  const [stats, setStats] = useState<StatItemProps[]>([
    {
      value: 100,
      suffix: "%",
      label: "核心技术自主研发",
      sublabel: "完全拥有三维编织核心算法及软硬件著作权"
    },
    {
      value: 34,
      suffix: "+",
      label: "远销国家和地区",
      sublabel: "卓越品质在国际复材与高端制造市场获得认可"
    },
    {
      value: 6,
      suffix: "m",
      label: "最大编织成形长度",
      sublabel: "具备大尺寸火箭喷管与飞机纵梁加工能力"
    },
    {
      prefix: "±",
      value: 1,
      suffix: "℃",
      label: "产线闭环温控精度",
      sublabel: "基于数字孪生模型的成型工艺高精度控制"
    }
  ]);

  useEffect(() => {
    fetch("/api/homepage")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.stats)) {
          setStats(data.stats);
        }
      })
      .catch((err) => console.error("Failed to fetch stats:", err));
  }, []);

  return (
    <section className="relative w-full bg-gradient-to-b from-[#0a1128] to-[#101f42] py-12 md:py-16 overflow-hidden">
      {/* Background grid / decorations */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="absolute -left-1/4 -top-1/2 w-1/2 h-full bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -right-1/4 -bottom-1/2 w-1/2 h-full bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-2 md:gap-4 divide-y divide-white/5 lg:divide-y-0">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={idx >= 2 ? "max-lg:pt-8" : ""}
            >
              <StatItem {...stat} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
