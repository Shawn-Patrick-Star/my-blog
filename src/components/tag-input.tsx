"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagInputProps {
  name: string;
  defaultTags?: string[];
  placeholder?: string;
  className?: string;           // 添加 className 支持
  inputClassName?: string;      // 专门给输入框的样式
  badgeClassName?: string;      // 专门给标签的样式
}

export function TagInput({ 
  name, 
  defaultTags = [], 
  placeholder,
  className,
  inputClassName,
  badgeClassName
}: TagInputProps) {
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setInputValue("");
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // 默认占位符
  const defaultPlaceholder = tags.length === 0 
    ? "输入标签后按回车..." 
    : "添加更多标签...";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* 输入框 */}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || defaultPlaceholder}
        className={cn(
          "focus-visible:ring-primary/30 focus:border-primary",
          inputClassName
        )}
      />

      {/* 标签列表 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
          {tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className={cn(
                "px-3 py-1 transition-colors flex items-center gap-1 group",
                badgeClassName
              )}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="opacity-50 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <input type="hidden" name={name} value={tags.join(",")} />
    </div>
  );
}