"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";

const navLinks = [
    { href: "/", label: "首页" },
    { href: "/eng-chat", label: "EngChat" },
    { href: "/community", label: "社区" },
    { href: "/blog", label: "笔记" },
    { href: "/about", label: "关于" },
];

export function Navbar({ initialUser }: { initialUser: any }) {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(true);
    const [isAtTop, setIsAtTop] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isMouseInsideRef = useRef(false);
    const navRef = useRef<HTMLDivElement>(null);

    // 监听滚动位置
    useEffect(() => {
        const handleScroll = () => {
            if (!isMouseInsideRef.current) {
                startHideTimer();
            }
        };

        const startHideTimer = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setIsVisible(false);
            }, 2000);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const showNav = () => {
        isMouseInsideRef.current = true;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsVisible(true);
    };

    const hideNav = () => {
        isMouseInsideRef.current = false;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 2000);
    };

    // 处理鼠标离开导航栏区域
    const handleMouseLeave = () => {
        hideNav();
    };

    // 添加页面可见性变化监听
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            } else {
                if (!isMouseInsideRef.current) {
                    hideNav();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // 初始化显示（初始可见，但随后自动隐藏）
    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            if (!isMouseInsideRef.current) {
                setIsVisible(false);
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [pathname]);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div 
            ref={navRef}
            className="fixed top-0 left-0 w-full z-50 group"
            onMouseEnter={showNav}
            onMouseLeave={handleMouseLeave}
        >
            <div className={cn(
                "w-full px-4 flex justify-center transition-all duration-500 ease-out",
                isVisible 
                    ? "translate-y-0 opacity-100" 
                    : "-translate-y-full opacity-0"
            )}>
                <nav className="flex h-14 w-full max-w-4xl items-center justify-between rounded-full border border-border/50 bg-card backdrop-blur-xl px-6 shadow-lg transition-all duration-300">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors"
                    >
                        Garden.
                    </Link>

                    {/* 导航链接 - 响应式间距 */}
                    <div className="hidden sm:flex items-center justify-center gap-4 md:gap-6 lg:gap-8">
                        {navLinks.map(({ href, label }) => {
                            const isActive =
                                href === "/" ? pathname === "/" : pathname.startsWith(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        "transition-all relative py-1 whitespace-nowrap",
                                        isActive
                                            ? "text-primary font-bold tracking-wide"
                                            : "text-foreground hover:text-primary hover:scale-105"
                                    )}
                                >
                                    {label}
                                    {isActive && (
                                        <span className="absolute -bottom-2 left-1/2 w-1/2 -translate-x-1/2 h-1 bg-primary rounded-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* 移动端菜单占位 */}
                    <div className="sm:hidden">
                    </div>

                    {/* 右侧图标 */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <ThemeToggle />
                        <UserNav initialUser={initialUser} />
                    </div>
                </nav>
            </div>
        </div>
    );
}