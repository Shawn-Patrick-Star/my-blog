"use client";

import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ShareButton({ title }: { title?: string }) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: title || "我的博客笔记",
                    url: url,
                });
            } catch (err: any) {
                // Only log if it's not a user-cancellation error
                if (err.name !== "AbortError") {
                    console.error("分享失败:", err);
                }
            }
        } else {
            // 降级方案：复制链接到剪贴板
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error("复制链接失败:", err);
            }
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleShare}
            className="gap-2 transition-all shadow-sm rounded-full text-muted-foreground hover:text-primary hover:bg-accent hover:border-primary/20 border-border"
        >
            {copied ? <Check size={18} /> : <Share2 size={18} />}
            <span>{copied ? "已复制长链接" : "转发 / 分享"}</span>
        </Button>
    );
}
