"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

export function TableOfContents() {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        // 稍等以确保 Markdown 渲染完毕
        const timer = setTimeout(() => {
            const elements = Array.from(document.querySelectorAll("h1, h2, h3"))
                .filter((element) => element.id)
                .map((element) => ({
                    id: element.id,
                    text: element.textContent || "",
                    level: Number(element.tagName.charAt(1)),
                }));
            setHeadings(elements);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "0px 0px -80% 0px" }
        );

        document.querySelectorAll("h1, h2, h3").forEach((elem) => {
            observer.observe(elem);
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) {
        return null;
    }

    return (
        <nav className="sticky top-24 hidden lg:block w-64 max-h-[calc(100vh-6rem)] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
            <h4 className="text-sm font-semibold mb-4 text-foreground/80 uppercase tracking-wider">目录</h4>
            <ul className="space-y-2.5 text-sm">
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        className={cn(
                            "transition-colors hover:text-primary",
                            heading.level === 1 ? "ml-0 font-medium" : heading.level === 2 ? "ml-3 text-muted-foreground" : "ml-6 text-muted-foreground/80 text-xs",
                            activeId === heading.id ? "text-primary font-medium" : ""
                        )}
                    >
                        <a href={`#${heading.id}`} className="line-clamp-1">
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
