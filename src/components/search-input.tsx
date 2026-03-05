"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce"; // 需要 npm install use-debounce 或者手写
import { useEffect, useState } from "react";

import { usePathname } from "next/navigation";

export function SearchInput({
  defaultValue,
  placeholder = "搜索笔记或动态..."
}: {
  defaultValue: string;
  placeholder?: string;
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
    <div className="relative shadow-lg rounded-full">
      <Search className="absolute left-4 top-3 text-muted-foreground w-5 h-5" />
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="pl-12 h-12 rounded-full border-border bg-background/80 backdrop-blur focus-visible:ring-primary/20 text-base"
      />
    </div>
  );
}