"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  name: string; // 表单字段名
  defaultTags?: string[]; // 编辑模式下的默认标签
}

export function TagInput({ name, defaultTags = [] }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [inputValue, setInputValue] = useState("");

  // 处理回车添加标签
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // 防止触发表单提交
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // 当输入框为空按退格键，删除最后一个标签
      setTags(tags.slice(0, -1));
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm gap-1 hover:bg-zinc-200">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-zinc-500 hover:text-red-500 transition-colors"
            >
              <X size={14} />
            </button>
          </Badge>
        ))}
      </div>
      
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? "输入标签后按回车..." : "继续添加..."}
        className="bg-zinc-50 focus-visible:ring-amber-200"
      />

      {/* 核心：这是一个隐藏的输入框，用于把数据传给 Server Action */}
      {/* 我们用逗号拼接数组，后端再拆开 */}
      <input type="hidden" name={name} value={tags.join(",")} />
      
      <p className="text-xs text-zinc-400">输入内容后按 Enter 键生成标签</p>
    </div>
  );
}