"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    if (!isVisible) return null;

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg bg-popover/80 backdrop-blur-sm hover:bg-popover text-muted-foreground hover:text-primary border-border animate-in fade-in slide-in-from-bottom-4"
            title="回到顶部"
        >
            <ArrowUp size={20} />
        </Button>
    );
}
