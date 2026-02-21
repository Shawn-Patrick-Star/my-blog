"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce"; // 需要 npm install use-debounce 或者手写
import { useEffect, useState } from "react";

export function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const [text, setText] = useState(defaultValue);
  const [query] = useDebounce(text, 500); // 防抖 500ms

  useEffect(() => {
    // 当 query 变化时，推送到 URL
    if (query) {
      router.push(`/?q=${query}`);
    } else {
      router.push("/");
    }
  }, [query, router]);

  return (
    <div className="relative shadow-lg rounded-full">
      <Search className="absolute left-4 top-3 text-zinc-400 w-5 h-5" />
      <Input 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="搜索笔记或动态..." 
        className="pl-12 h-12 rounded-full border-none bg-white/90 backdrop-blur focus-visible:ring-amber-200 text-base"
      />
    </div>
  );
}