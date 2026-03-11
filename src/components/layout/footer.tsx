"use client";

import { usePathname } from "next/navigation";

export function Footer() {
    const pathname = usePathname();
    
    // Hide footer on EngChat page
    if (pathname?.startsWith('/eng-chat')) {
        return null;
    }

    return (
        <footer className="py-10 text-center text-xs text-muted-foreground border-t border-border mt-4 transition-colors">
            <p>© {new Date().getFullYear()} Garden. Built with Next.js & Supabase.</p>
            <p className="mt-1 opacity-60 italic">用心记录每一个瞬间 ✨</p>
        </footer>
    );
}
