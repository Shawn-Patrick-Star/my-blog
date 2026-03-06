"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/layout/user-nav";

const navLinks = [
    { href: "/", label: "首页" },
    { href: "/community", label: "社区" },
    { href: "/blog", label: "笔记" },
    { href: "/about", label: "关于" },
];
export function Navbar({ initialUser }: { initialUser: any }) {
    const pathname = usePathname();

    return (
        <div className="sticky top-0 z-50 w-full px-4 flex justify-center">
            <nav className="flex h-14 w-full max-w-4xl items-center justify-between rounded-full border border-border/50 bg-card/60 backdrop-blur-xl px-6 shadow-sm">
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

                {/* 移动端菜单 - 可以后续添加 */}
                <div className="sm:hidden">
                    {/* 移动端汉堡菜单 */}
                </div>

                {/* 右侧图标 */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <ThemeToggle />
                    <UserNav initialUser={initialUser} />
                </div>
            </nav>
        </div>
    );
}
