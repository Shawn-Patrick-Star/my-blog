"use client"; // 👈 必须加上这一行！

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Hash, FileText, Trash2, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { deletePost } from "@/lib/actions";

interface BlogCardProps {
  post: any;
  isAdmin?: boolean;
}

export function BlogCard({ post, isAdmin }: BlogCardProps) {
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止点击卡片跳转
    e.stopPropagation(); // 防止事件冒泡
    
    if (confirm(`确定要删除文章《${post.title}》吗？`)) {
      try {
        await deletePost(post.id);
        // 这里不需要 alert，因为 actions 里有 revalidatePath，页面会自动刷新
      } catch (err: any) {
        alert("删除失败: " + err.message);
      }
    }
  };

  return (
    <div className="group relative h-full">
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <Card className="overflow-hidden hover:shadow-md transition-all duration-300 bg-[#fffef9] border-amber-100/50 h-full flex flex-col">
          <div className="flex flex-col md:flex-row h-full">
            
            {/* 左侧文字区 */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-amber-600/70 mb-2">
                  <time>{format(new Date(post.created_at), "yyyy-MM-dd")}</time>
                  {post.word_count > 0 && (
                    <span className="flex items-center gap-1">
                      <FileText size={10} /> {post.word_count} 字
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-zinc-800 mb-3 group-hover:text-amber-600 transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed mb-4">
                  {post.excerpt || "暂无简介..."}
                </p>
              </div>

              {/* 标签 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-amber-50 text-amber-600/80 text-xs rounded-md flex items-center gap-1 border border-amber-100">
                      <Hash size={10} /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧图片区 */}
            {post.cover_image && (
              <div className="relative w-full md:w-48 h-48 md:h-auto shrink-0">
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
          </div>
        </Card>
      </Link>

      {/* 管理员按钮组 (绝对定位悬浮) */}
      {isAdmin && (
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          {/* 编辑按钮：直接跳转 */}
          <Link href={`/admin/write/${post.id}`}>
            <div className="p-2 bg-white/90 text-blue-600 rounded-full shadow-sm hover:bg-blue-50 border border-zinc-200 cursor-pointer">
              <Edit size={16} />
            </div>
          </Link>
          
          {/* 删除按钮：触发点击事件 */}
          <button 
            onClick={handleDelete}
            className="p-2 bg-white/90 text-red-600 rounded-full shadow-sm hover:bg-red-50 border border-zinc-200 cursor-pointer" 
            title="删除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}