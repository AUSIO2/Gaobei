"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";

let globalSlidesCache: string[] | null = null;

export default function FrontSlide() {
  const [images, setImages] = useState<string[]>(globalSlidesCache || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(!globalSlidesCache);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    // Attempt to read from localStorage if memory cache is not populated
    if (!globalSlidesCache) {
      try {
        const cached = localStorage.getItem("gaobei-slides");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            globalSlidesCache = parsed;
            setImages(parsed);
            setLoading(false);
          }
        }
      } catch (e) {
        console.error("Failed to read slides cache from localStorage", e);
      }
    }

    fetch("/api/slides")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setImages(data);
          globalSlidesCache = data;
          try {
            localStorage.setItem("gaobei-slides", JSON.stringify(data));
          } catch (e) {
            console.error(e);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load slides", err);
        setLoading(false);
      });
  }, []);

  // Auto play slides every 5 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [images, currentIndex]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Touch/drag handler for swipe gestures
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  if (loading) {
    return (
      <div className="w-full aspect-[16/9] max-w-6xl mx-auto px-4 md:px-8 mt-20 md:mt-24 mb-8 md:mb-12">
        <div className="w-full h-full flex items-center justify-center bg-neutral-100 rounded-2xl animate-pulse border border-neutral-200/50">
          <span className="text-neutral-400 font-medium text-sm md:text-base">正在加载滑动图片栏...</span>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-[60px] md:mt-[72px] bg-neutral-950">
      <div className="relative w-full h-[35vh] sm:h-[40vh] md:h-[50vh] overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentIndex}
            src={`/api/slides/${encodeURIComponent(images[currentIndex])}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0 w-full h-full object-cover object-center bg-neutral-950 select-none touch-pan-y"
            alt={`Slide ${currentIndex + 1}`}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            draggable={false}
          />
        </AnimatePresence>

        {/* 指示圆点 */}
        {images.length > 1 && (
          <div className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-white w-6 md:w-5" : "bg-white/40 hover:bg-white/60 w-2.5"
                }`}
                style={{ minWidth: '10px', minHeight: '10px' }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
