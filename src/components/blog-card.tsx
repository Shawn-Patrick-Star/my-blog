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
        <Card className="p-0 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1.5 transition-all duration-500 bg-card border-border/50 h-full shadow-sm rounded-2xl">
          <div className="flex flex-col md:flex-row items-stretch h-full min-h-[220px]">
            {/* 左侧文字内容区 */}
            <div className="flex-1 p-8 flex flex-col justify-between order-2 md:order-1">
              <div>
                <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground/80 mb-4 font-bold tracking-widest uppercase">
                  <time>
                    {format(new Date(post.created_at), "yyyy-MM-dd")}
                  </time>
                  {post.category && (
                    <>
                      <span className="opacity-30">|</span>
                      <span className="text-primary font-black">
                        {post.category}
                      </span>
                    </>
                  )}
                  {post.word_count > 0 && (
                    <>
                      <span className="opacity-30">|</span>
                      <span className="flex items-center gap-1">
                        <FileText size={10} /> {post.word_count}
                      </span>
                    </>
                  )}
                </div>

                <h3 className="text-2xl font-black text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight tracking-tight">
                  {post.title}
                </h3>

                <p className="text-muted-foreground/90 text-sm line-clamp-2 leading-relaxed mb-6 font-medium">
                  {post.excerpt || "点击阅读全文以了解更多精彩内容..."}
                </p>
              </div>

              {/* 标签 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-secondary text-secondary-foreground text-[10px] uppercase tracking-wider rounded-md font-bold border border-border/50"
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
            <div className="p-2 bg-popover/80 backdrop-blur-sm text-primary rounded-full shadow-lg hover:bg-primary hover:text-primary-foreground border border-border transition-all">
              <Edit size={14} />
            </div>
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 bg-popover/80 backdrop-blur-sm text-destructive rounded-full shadow-lg hover:bg-destructive hover:text-destructive-foreground border border-destructive/20 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}