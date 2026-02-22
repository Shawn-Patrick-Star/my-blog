"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/", label: "动态" },
    { href: "/blog", label: "笔记" },
    { href: "/admin", label: "后台" },
    { href: "/about", label: "关于" },
];

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-amber-100/60 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
                <Link
                    href="/"
                    className="text-lg font-bold tracking-tight text-amber-700 hover:text-amber-800 transition-colors"
                >
                    Garden.
                </Link>
                <div className="flex gap-6 text-sm font-medium">
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
                                        ? "text-amber-700 font-semibold"
                                        : "text-zinc-500 hover:text-zinc-800"
                                )}
                            >
                                {label}
                                {isActive && (
                                    <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
