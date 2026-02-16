import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const revalidate = 0; // 每次访问都获取最新文章

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("is_published", true) // 只显示已发布的
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">学习笔记</h1>
      
      <div className="grid gap-4">
        {posts?.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <Card className="hover:border-zinc-400 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <span className="text-sm text-zinc-500 font-normal">
                    {format(new Date(post.created_at), "yyyy-MM-dd")}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-600 line-clamp-2">
                  {post.excerpt || "暂无摘要..."}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
        
        {(!posts || posts.length === 0) && (
          <p className="text-zinc-500 text-center py-10">还没有写过笔记呢。</p>
        )}
      </div>
    </div>
  );
}