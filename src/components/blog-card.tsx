"use client";

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Hash, FileText, Trash2, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { deletePost } from "@/lib/actions/post";
import type { Post } from "@/lib/types";

interface BlogCardProps {
  post: Post;
  isAdmin?: boolean;
}

export function BlogCard({ post, isAdmin }: BlogCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`确定要删除文章《${post.title}》吗？`)) {
      try {
        await deletePost(post.id);
      } catch (err: any) {
        alert("删除失败: " + err.message);
      }
    }
  };

  return (
    <div className="group relative h-full">
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <Card className="p-0 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-[#fffef9] border-amber-100/50 h-full">
          <div className="flex flex-col md:flex-row items-stretch h-full min-h-40">
            {/* 左侧文字内容区 */}
            <div className="flex-1 p-6 flex flex-col justify-between order-2 md:order-1">
              <div>
                <div className="flex items-center gap-3 text-xs text-amber-600/70 mb-3 font-mono">
                  <time>
                    {format(new Date(post.created_at), "yyyy-MM-dd")}
                  </time>
                  {post.word_count > 0 && (
                    <span className="flex items-center gap-1 opacity-80">
                      <FileText size={10} /> {post.word_count} 字
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-zinc-800 mb-2 group-hover:text-amber-600 transition-colors line-clamp-1">
                  {post.title}
                </h3>

                <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed mb-4">
                  {post.excerpt || "点击阅读全文以了解更多精彩内容..."}
                </p>
              </div>

              {/* 标签 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] uppercase tracking-wider rounded font-bold border border-amber-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧图片区 */}
            {post.cover_image && (
              <div className="relative w-full md:w-1/3 min-h-45 md:min-h-full shrink-0 order-1 md:order-2">
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={false}
                />
              </div>
            )}
          </div>
        </Card>
      </Link>

      {/* 管理员按钮 */}
      {isAdmin && (
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <Link href={`/admin/write/${post.id}`}>
            <div className="p-2 bg-white/80 backdrop-blur-sm text-amber-600 rounded-full shadow-lg hover:bg-amber-500 hover:text-white border border-amber-100 transition-all">
              <Edit size={14} />
            </div>
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 bg-white/80 backdrop-blur-sm text-red-600 rounded-full shadow-lg hover:bg-red-600 hover:text-white border border-red-100 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}