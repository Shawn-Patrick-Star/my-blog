"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Github } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
    { href: "/", label: "动态" },
    { href: "/blog", label: "笔记" },
    { href: "/admin", label: "后台" },
    { href: "/about", label: "关于" },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-navbar/80 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
                <Link
                    href="/"
                    className="text-lg font-bold tracking-tight text-primary hover:text-primary/80 transition-colors"
                >
                    Garden.
                </Link>

                <div className="flex items-center gap-6 text-sm font-medium">
                    <div className="flex gap-6">
                        {navLinks.map(({ href, label }) => {
                            const isActive =
                                href === "/" ? pathname === "/" : pathname.startsWith(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={cn(
                                        "transition-colors relative py-1",
                                        isActive
                                            ? "text-primary font-semibold"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {label}
                                    {isActive && (
                                        <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary rounded-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-muted-foreground hover:text-primary transition-colors hidden sm:block delay-150"
                            title="GitHub"
                        >
                            <Github size={20} />
                        </a>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
}
