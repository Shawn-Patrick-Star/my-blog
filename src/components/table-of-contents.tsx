"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface TocItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    content?: string; // 可选的原始内容，用于编辑器模式
}

export function TableOfContents({ content }: TableOfContentsProps) {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");
    const navRef = useRef<HTMLUListElement>(null);
    const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

    useEffect(() => {
        // 如果提供了 content，则手动解析（适用于编辑器预览或无 DOM 环境）
        if (content) {
            const lines = content.split('\n');
            const elements: TocItem[] = [];
            const counts = new Map<string, number>();

            const slugify = (text: string) => {
                let base = text.toLowerCase()
                    .trim()
                    .replace(/[\s_-]+/g, '-')
                    .replace(/[^\w\-\u4e00-\u9fa5]/g, '') // 增加对中文字符的支持
                    .replace(/^-+|-+$/g, '');

                if (!base) base = 'heading';

                const count = counts.get(base) || 0;
                counts.set(base, count + 1);

                return count === 0 ? base : `${base}-${count}`;
            };

            lines.forEach((line) => {
                const match = line.trim().match(/^(#{1,6})\s+(.+)$/);
                if (match) {
                    const level = match[1].length;
                    const text = match[2].trim();
                    elements.push({
                        id: slugify(text), // 模拟 rehype-slug 的行为
                        text,
                        level,
                    });
                }
            });
            setHeadings(elements);
            return;
        }

        // 默认逻辑：从 DOM 中解析
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
    }, [content]);

    // 当 activeId 变化时，将对应条目滚动到目录中间
    useEffect(() => {
        if (!activeId || !navRef.current) return;

        const activeItem = itemRefs.current.get(activeId);
        if (!activeItem) return;

        const nav = navRef.current;
        const navHeight = nav.clientHeight;
        const itemOffsetTop = activeItem.offsetTop;
        const itemHeight = activeItem.clientHeight;

        // 计算让 activeItem 垂直居中所需的 scrollTop
        const targetScrollTop = itemOffsetTop - navHeight / 2 + itemHeight / 2;

        nav.scrollTo({
            top: targetScrollTop,
            behavior: "smooth",
        });
    }, [activeId]);

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
        return (
            <nav className="sticky top-24 opacity-60">
                <h4 className="text-sm font-semibold mb-4 text-foreground/80 uppercase tracking-wider text-center">
                    contents
                </h4>
                <hr className="border-t border-border mb-4" />
                <div className="text-center text-xs text-muted-foreground mt-10">
                    暂无目录
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-24">
            <h4 className="text-sm font-semibold mb-4 text-foreground/80 uppercase tracking-wider text-center">
                contents
            </h4>
            <hr className="border-t border-border mb-4" />
            {/* 
                max-h 限制为视口高度减去顶部偏移量（top-24 = 6rem）和一些底部间距
                overflow-y-auto 允许目录内部滚动，但隐藏滚动条
            */}
            <ul
                ref={navRef}
                className="space-y-2.5 text-sm overflow-y-auto scrollbar-none"
                style={{ maxHeight: "calc(100vh - 22rem)" }}
            >
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        ref={(el) => {
                            if (el) itemRefs.current.set(heading.id, el);
                            else itemRefs.current.delete(heading.id);
                        }}
                        className={cn(
                            "transition-colors hover:text-primary",
                            heading.level === 1
                                ? "ml-0 font-medium"
                                : heading.level === 2
                                ? "ml-3 text-muted-foreground"
                                : "ml-6 text-muted-foreground/80 text-xs",
                            activeId === heading.id ? "text-primary font-bold" : ""
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