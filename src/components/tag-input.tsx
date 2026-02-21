"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  name: string;
  defaultTags?: string[];
}

export function TagInput({ name, defaultTags = [] }: TagInputProps) {
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

  return (
    <div className="flex flex-col gap-3">
      {/* 1. 输入框在上 */}
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? "输入标签后按回车..." : "添加更多标签..."}
        className="bg-background border-input focus-visible:ring-primary/30 focus:border-primary"
      />

      {/* 2. 生成的标签在下 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
          {tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="px-3 py-1 bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 transition-colors flex items-center gap-1 group"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-amber-400 group-hover:text-red-500 transition-colors"
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