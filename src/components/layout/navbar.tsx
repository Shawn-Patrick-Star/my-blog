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

    // 判断是否为 /eng-chat 页面
    const isEngChatPage = pathname === '/eng-chat';

    // 监听滚动位置
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const atTop = scrollTop < 10;
            setIsAtTop(atTop);
            
            // 只有在不是 eng-chat 页面时才应用“滚动到顶部显示”的规则
            if (!isEngChatPage) {
                // 如果滚动到顶部，确保导航栏显示
                if (atTop) {
                    setIsVisible(true);
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = null;
                    }
                } else {
                    // 如果不在顶部且鼠标也不在导航栏内，启动隐藏计时器
                    if (!isMouseInsideRef.current) {
                        startHideTimer();
                    }
                }
            } else {
                // 在 eng-chat 页面：无论是否在顶部，只要鼠标不在导航栏内就启动隐藏计时器
                if (!isMouseInsideRef.current) {
                    startHideTimer();
                }
            }
        };

        const startHideTimer = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setIsVisible(false);
            }, 2000);
        };

        window.addEventListener('scroll', handleScroll);
        
        // 初始调用
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [isEngChatPage]); // 添加 isEngChatPage 作为依赖

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
        
        // 如果不是 eng-chat 页面且在顶部，不隐藏导航栏
        if (!isEngChatPage && isAtTop) return;
        
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 2000);
    };

    // 处理鼠标离开导航栏区域
    const handleMouseLeave = () => {
        // 如果不是 eng-chat 页面且在顶部，不隐藏
        if (!isEngChatPage && isAtTop) {
            isMouseInsideRef.current = false;
            return;
        }
        
        // 其他情况都允许隐藏
        hideNav();
    };

    // 添加页面可见性变化监听
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // 标签页隐藏时，清除计时器
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
            } else {
                // 标签页显示时，根据页面类型和鼠标状态决定是否隐藏
                if (isEngChatPage) {
                    // eng-chat 页面：只要鼠标不在内就隐藏
                    if (!isMouseInsideRef.current) {
                        hideNav();
                    }
                } else {
                    // 其他页面：不在顶部且鼠标不在内才隐藏
                    if (!isAtTop && !isMouseInsideRef.current) {
                        hideNav();
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isAtTop, isEngChatPage]);

    // 初始化显示（对 eng-chat 页面特殊处理）
    useEffect(() => {
        if (isEngChatPage) {
            // eng-chat 页面：初始显示，但启动隐藏计时器
            setIsVisible(true);
            if (!isMouseInsideRef.current) {
                hideNav();
            }
        }
    }, [isEngChatPage]);

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