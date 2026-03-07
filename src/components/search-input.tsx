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
  className
}: {
  defaultValue: string;
  placeholder?: string;
  className?: string;
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

  return (
    <div className={cn("relative shadow-lg rounded-full", className)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="pl-10 h-full rounded-full border-border bg-background/80 backdrop-blur focus-visible:ring-primary/20 text-sm"
      />
    </div>
  );
}