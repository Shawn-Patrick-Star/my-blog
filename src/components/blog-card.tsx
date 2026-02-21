import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Clock, Hash, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BlogCardProps {
  post: any;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="overflow-hidden hover:shadow-md transition-all duration-300 bg-[#fffef9] border-amber-100/50 group h-full">
        <div className="flex flex-col md:flex-row h-full">
          
          {/* 左侧：内容区 (占 2/3) */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-600/70 mb-2">
                <time>{format(new Date(post.created_at), "yyyy-MM-dd")}</time>
                {post.word_count > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FileText size={10} /> {post.word_count}字
                    </span>
                  </>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-zinc-800 mb-3 group-hover:text-amber-600 transition-colors">
                {post.title}
              </h3>
              
              <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed mb-4">
                {post.excerpt || "暂无简介..."}
              </p>
            </div>

            {/* 底部标签 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-auto">
                {post.tags.map((tag: string) => (
                  <span key={tag} className="px-2 py-1 bg-amber-50 text-amber-600/80 text-xs rounded-md flex items-center gap-1">
                    <Hash size={10} /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 右侧：图片区 (占 1/3) */}
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
  );
}