import { supabase } from "@/lib/supabase";
import { MomentCard } from "@/components/moment-card"; // 确保路径对
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

export const revalidate = 0;

export default async function Home() {
  // 并行获取数据：最新的1篇笔记 + 最新的动态
  const [postsResponse, momentsResponse] = await Promise.all([
    supabase.from("posts").select("*").eq("is_published", true).order("created_at", { ascending: false }).limit(1).single(),
    supabase.from("moments").select("*").order("created_at", { ascending: false }),
  ]);

  const latestPost = postsResponse.data;
  const moments = momentsResponse.data;

  return (
    <main className="min-h-screen bg-zinc-50/50 py-12 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-12">
        
        {/* 1. 个人简介区域 */}
        <section className="text-center space-y-4 mb-4">
          <div className="w-20 h-20 bg-zinc-200 rounded-full mx-auto overflow-hidden">
            {/* 可以在这里放 <img src="/avatar.jpg" /> */}
            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-2xl">Me</div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">你的名字</h1>
            <p className="text-zinc-500 mt-2">全栈开发者 / 摄影爱好者 / 终身学习者</p>
          </div>
        </section>

        {/* 2. 最新文章 (如果有的话) */}
        {latestPost && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> 最新笔记
              </h2>
              <Link href="/blog" className="text-sm text-blue-600 hover:underline flex items-center">
                全部文章 <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            
            <Link href={`/blog/${latestPost.slug}`}>
              <Card className="p-6 hover:shadow-md transition-all border-zinc-200 group">
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  {latestPost.title}
                </h3>
                <p className="text-zinc-500 line-clamp-2 mb-4 text-sm leading-relaxed">
                  {latestPost.excerpt || "点击阅读全文..."}
                </p>
                <div className="text-xs text-zinc-400">
                  {format(new Date(latestPost.created_at), "yyyy-MM-dd")}
                </div>
              </Card>
            </Link>
          </section>
        )}

        {/* 3. 动态流 */}
        <section className="flex flex-col items-center gap-6">
          <div className="w-full flex justify-between items-center border-b border-zinc-200 pb-2">
            <h2 className="text-lg font-bold">碎片动态</h2>
          </div>

          <div className="w-full space-y-6">
            {moments?.map((item) => (
              <div key={item.id} className="flex justify-center">
                <MomentCard 
                  content={item.content}
                  createdAt={item.created_at}
                  images={item.images}
                />
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}