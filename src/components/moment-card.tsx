"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { Trash2, Edit3 } from "lucide-react"; // 引入 Edit3
import { deleteMoment } from "@/lib/actions";
import Link from "next/link"; // 引入 Link

interface MomentCardProps {
  id?: string;
  content: string;
  createdAt: string;
  images?: string[];
  isAdmin?: boolean;
}

export function MomentCard({ id, content, createdAt, images, isAdmin }: MomentCardProps) {
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!id) return;
    if (confirm("确定要删除这条动态吗？")) {
      try {
        await deleteMoment(id);
      } catch (err: any) {
        alert("删除失败: " + err.message);
      }
    }
  };

  return (
    <Card className="w-full border-amber-100/50 shadow-sm hover:shadow-md transition-shadow bg-[#fffef9] group relative">
      <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
        <div className="h-10 w-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-600 text-sm">
          Me
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-zinc-800">我的动态</span>
          <span className="text-xs text-zinc-400">
            {format(new Date(createdAt), "yyyy-MM-dd HH:mm")}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-4">
        {/* 这里可以使用之前创建的 MarkdownRenderer */}
        <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap mb-2">
          {content}
        </p>
        
        {images && images.length > 0 && (
          <div className={`mt-3 grid gap-2 ${
            images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
          }`}>
            {images.map((url, index) => (
              <img key={index} src={url} alt="moment" className="rounded-lg object-cover w-full aspect-square" />
            ))}
          </div>
        )}
      </CardContent>

      {/* 管理员操作组 */}
      {isAdmin && id && (
        <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
          {/* 编辑按钮 */}
          <Link href={`/admin/moments/${id}`} className="text-zinc-400 hover:text-blue-500 transition-colors">
            <Edit3 size={18} />
          </Link>
          {/* 删除按钮 */}
          <button onClick={handleDelete} className="text-zinc-400 hover:text-red-500 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </Card>
  );
}