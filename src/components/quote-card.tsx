"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";

export interface QuoteItem {
    text: string;
    source?: string;
}

interface QuoteCardProps {
    quotes: QuoteItem[];
}

export function QuoteCard({ quotes }: QuoteCardProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const displayQuotes: QuoteItem[] = quotes.length > 0
        ? quotes
        : [
            { text: "愿你历经千帆，归来仍是少年。" },
            { text: "生如夏花之绚烂，死如秋叶之静美。", source: "泰戈尔" },
            { text: "每一个不曾起舞的日子，都是对生命的辜负。", source: "尼采" },
        ];

    useEffect(() => {
        if (displayQuotes.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % displayQuotes.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [displayQuotes.length]);

    const current = displayQuotes[currentIndex];

    return (
        <div className="relative w-full my-12">
            <div className="relative bg-[#fdf6e3] rounded-2xl shadow-lg border border-amber-200/60 p-8 md:p-12 overflow-hidden">
                {/* 作文纸条横线 */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.08]"
                    style={{
                        backgroundImage: "repeating-linear-gradient(transparent, transparent 2.4rem, #8b7355 2.4rem, #8b7355 calc(2.4rem + 1px))",
                    }}
                />

                {/* 红色竖线 (作文纸风格) */}
                <div className="absolute left-6 md:left-8 top-0 bottom-0 w-[2px] bg-red-300/40" />

                <div className="relative z-10 flex flex-col items-center text-center pl-4 md:pl-6">
                    <Quote className="text-amber-400/50 mb-5 w-8 h-8" />

                    <div className="min-h-24 flex flex-col items-center justify-center gap-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.8 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <p className="text-xl md:text-2xl font-serif italic text-amber-950/80 leading-relaxed font-medium">
                                    「{current.text}」
                                </p>
                                {current.source && (
                                    <span className="text-sm text-amber-700/60 font-medium tracking-wider">
                                        —— {current.source}
                                    </span>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="mt-6 w-16 h-0.5 bg-amber-300/40 rounded-full" />
                </div>
            </div>
        </div>
    );
}
