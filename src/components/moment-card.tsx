"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { Trash2 } from "lucide-react"; // 引入垃圾桶图标
import { deleteMoment } from "@/lib/actions"; // 引入删除动作
import { useState } from "react";
import { cn } from "@/lib/utils"; // Shadcn 的工具函数

interface MomentCardProps {
  id: string; // 新增：需要 ID 才能删除
  content: string;
  createdAt: string;
  images?: string[];
  isAdmin?: boolean; // 新增：判断权限
}

export function MomentCard({ id, content, createdAt, images, isAdmin }: MomentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // 删除逻辑
  const handleDelete = async () => {
    if (confirm("确定要删除这条动态吗？不可恢复。")) {
      setIsDeleting(true);
      try {
        await deleteMoment(id);
        // 删除成功后，页面通常会自动刷新 (因为 Server Action 里调用了 revalidatePath)
        // 这里只是为了 UI 交互，防止用户重复点击
      } catch (error: any) {
        alert("删除失败: " + error.message);
        setIsDeleting(false);
      }
    }
  };

  // 根据图片数量计算 Grid 样式
  const getImageGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-3"; // 或者 grid-cols-2 第一张大图
    if (count === 4) return "grid-cols-2";
    return "grid-cols-3"; // 4张以上九宫格
  };

  if (isDeleting) return null; // 删除时临时隐藏卡片

  return (
    <Card className="group relative w-full border-amber-100/50 shadow-sm hover:shadow-md transition-shadow bg-[#fffef9]">
      <CardHeader className="flex flex-row items-start gap-3 p-4 pb-2">
        {/* 头像区域 */}
        <div className="h-10 w-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-600 text-sm shrink-0">
          Me
        </div>
        
        <div className="flex flex-col pt-0.5">
          <span className="text-sm font-semibold text-zinc-800">我的动态</span>
          <span className="text-xs text-zinc-400">
            {format(new Date(createdAt), "yyyy-MM-dd HH:mm")}
          </span>
        </div>

        {/* --- 管理员删除按钮 (悬浮显示) --- */}
        {isAdmin && (
          <button
            onClick={handleDelete}
            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-full"
            title="删除动态"
          >
            <Trash2 size={16} />
          </button>
        )}
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-0 ml-12"> {/* ml-12 让内容跟头像对齐 */}
        {/* 文本内容 */}
        {content && (
          <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap mb-3">
            {content}
          </p>
        )}
        
        {/* 图片九宫格 */}
        {images && images.length > 0 && (
          <div className={cn("grid gap-1.5 overflow-hidden rounded-lg", getImageGridClass(images.length))}>
            {images.map((url, index) => (
              <div 
                key={index} 
                className={cn(
                  "relative bg-zinc-100 overflow-hidden",
                  // 如果是1张图，限制最大高度
                  images.length === 1 ? "h-64 md:h-80 w-full max-w-sm" : "aspect-square"
                )}
              >
                <img 
                  src={url} 
                  alt={`moment-${index}`} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}