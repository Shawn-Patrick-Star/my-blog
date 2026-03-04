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
            <div className="relative bg-paper-bg rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-paper-border p-8 md:p-12 overflow-hidden transition-all duration-300">
                {/* 作文纸条横线 */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.05]"
                    style={{
                        backgroundImage: "repeating-linear-gradient(transparent, transparent 2.4rem, hsl(var(--paper-line)) 2.4rem, hsl(var(--paper-line)) calc(2.4rem + 1px))",
                    }}
                />

                {/* 红色竖线 (作文纸风格) */}
                <div className="absolute left-6 md:left-8 top-0 bottom-0 w-[2px] bg-paper-margin/40 dark:bg-paper-margin/20" />

                <div className="relative z-10 flex flex-col items-center text-center pl-4 md:pl-6 text-paper-text">
                    <Quote className="text-paper-line/30 mb-5 w-8 h-8" />

                    <div className="min-h-24 flex flex-col items-center justify-center gap-3 text-inherit transition-colors">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.8 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <p className="text-xl md:text-2xl font-serif italic leading-relaxed font-medium">
                                    「{current.text}」
                                </p>
                                {current.source && (
                                    <span className="text-sm opacity-60 font-medium tracking-wider">
                                        —— {current.source}
                                    </span>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="mt-6 w-16 h-0.5 bg-paper-line/20 rounded-full" />
                </div>
            </div>
        </div>
    );
}
