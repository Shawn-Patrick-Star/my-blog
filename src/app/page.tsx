import { supabase } from "@/lib/supabase"; 
import { MomentCard } from "@/components/moment-card";

// 告诉 Next.js 这一页不缓存，每次都去取最新的动态
export const revalidate = 0;

export default async function Home() {
  // 从 Supabase 获取 moments 表的所有数据，按时间倒序排列
  const { data: moments, error } = await supabase
    .from("moments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching moments:", error);
  }

  return (
    <main className="min-h-screen bg-zinc-50 py-10 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        
        {/* 顶部标题栏 */}
        <section className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">我的数字花园</h1>
          <p className="text-zinc-500 text-sm">记录学习、思考与生活</p>
        </section>

        {/* 动态流 (Moments Flow) */}
        <section className="flex flex-col items-center gap-6">
          <div className="w-full flex justify-between items-center max-w-md">
            <h2 className="text-lg font-semibold">最近动态</h2>
            <span className="text-xs text-zinc-400">生活碎片</span>
          </div>

          {moments && moments.length > 0 ? (
            moments.map((item) => (
              <MomentCard 
                key={item.id}
                content={item.content}
                createdAt={item.created_at}
                images={item.images}
              />
            ))
          ) : (
            <div className="text-zinc-400 text-sm py-10">暂无动态，去后台发一条吧！</div>
          )}
        </section>

      </div>
    </main>
  );
}