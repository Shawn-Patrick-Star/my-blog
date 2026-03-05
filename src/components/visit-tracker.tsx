"use client";

import { useEffect } from "react";
import { trackVisitAction } from "@/lib/actions/stats";

export function VisitTracker() {
    useEffect(() => {
        // 延迟一秒记录，防止极短时间内的误触或爬虫
        const timer = setTimeout(() => {
            trackVisitAction();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return null;
}
