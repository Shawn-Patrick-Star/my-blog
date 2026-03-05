"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface HeroSliderProps {
    images: string[];
}

export function HeroSlider({ images }: HeroSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // 如果没有图，显示一个默认的
    const displayImages = images.length > 0
        ? images
        : ["https://images.unsplash.com/photo-1490750967868-58cb75069faf?q=80&w=2070&auto=format&fit=crop"];

    useEffect(() => {
        if (displayImages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % displayImages.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [displayImages.length]);

    return (
        <div className="absolute inset-0 z-0">
            <AnimatePresence initial={false} mode="popLayout"> {/* 修改这里 */}
                {/* 当前图片 - 淡出 */}
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                        opacity: { duration: 1.0, ease: "easeInOut" }
                    }}
                    className="absolute inset-0"
                >
                    <Image
                        src={displayImages[currentIndex]}
                        alt="Hero Background"
                        fill
                        className="object-cover brightness-75 transition-transform duration-10000 scale-100 group-hover:scale-110"
                        priority
                    />
                </motion.div>
            </AnimatePresence>

            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/20 pointer-events-none" />
        </div>
    );
}