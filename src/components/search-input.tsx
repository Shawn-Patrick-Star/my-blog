"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce"; // 需要 npm install use-debounce 或者手写
import { useEffect, useState } from "react";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SearchInput({
  defaultValue,
  placeholder = "搜索笔记或动态...",
  className,
  size = "default"
}: {
  defaultValue: string;
  placeholder?: string;
  className?: string;
  size?: "default" | "lg";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [text, setText] = useState(defaultValue);
  const [query] = useDebounce(text, 500); // 防抖 500ms

  useEffect(() => {
    // 只有在完成初次加载或者 text 真正改变时才触发
    if (text === defaultValue) return;

    if (query) {
      router.push(`${pathname}?q=${query}`);
    } else {
      router.push(pathname);
    }
  }, [query, router, pathname, defaultValue]);

  const isLarge = size === "lg";

  return (
    <div className={cn("relative group transition-all duration-300 w-full", className)}>
      {/* 只有大尺寸版显示流光光晕 */}
      {isLarge && (
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      )}
      
      <div className={cn(
        "relative flex items-center rounded-full bg-background border border-border/60 overflow-hidden transition-all",
        isLarge 
          ? "shadow-lg focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/20" 
          : "shadow-sm border-border/80"
      )}>
        <Search className={cn(
          "ml-4 text-muted-foreground transition-colors",
          isLarge ? "w-5 h-5 group-focus-within:text-primary" : "w-4 h-4"
        )} />
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full placeholder:text-muted-foreground/50",
            isLarge ? "h-12 md:h-14 pl-3 pr-6 text-base md:text-lg" : "h-9 md:h-10 pl-2 pr-4 text-sm"
          )}
        />
      </div>
    </div>
  );
}