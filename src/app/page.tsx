import { createClient } from "@/utils/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { HeroSection } from "@/components/hero-section";
import { BlogCard } from "@/components/blog-card";
import { MomentCard } from "@/components/moment-card";
import { SearchInput } from "@/components/search-input";
import { SectionHeader } from "@/components/section-header";
import { QuoteCard } from "@/components/quote-card";
import type { QuoteItem } from "@/components/quote-card";
import { HomeSidebar } from "@/components/home-sidebar";
import { VisitTracker } from "@/components/visit-tracker";
import type { Post, Moment } from "@/lib/types";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  const supabase = await createClient();

  // 1. 并行执行所有独立查询，提升页面响应速度
  const [
    userWithProfile,
    { data: configs },
    { data: stats },
    { data: posts },
    { data: moments }
  ] = await Promise.all([
    getCurrentUser(),
    supabase.from("site_config").select("key, value"),
    supabase.from("site_stats").select("*").eq("id", 1).single(),
    supabase
      .from("posts")
      .select("*, author:profiles!author_id(*)")
      .eq("is_published", true)
      .ilike("title", query ? `%${query}%` : "%%") // 这里的 query 直接用入参
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("moments")
      .select("*, author:profiles!author_id(*)")
      .ilike("content", query ? `%${query}%` : "%%")
      .order("likes", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(4)
  ]);

  const isAdmin = userWithProfile?.profile.role === "admin" || userWithProfile?.profile.role === "super_admin";

  // 2. 解析配置项
  const heroImage = configs?.find((c: any) => c.key === "hero_image")?.value || "";
  const heroImagesStr = configs?.find((c: any) => c.key === "hero_images")?.value;
  let heroImages: string[] = [];
  try {
    if (heroImagesStr) heroImages = JSON.parse(heroImagesStr);
  } catch (e) { }

  const siteTitle = configs?.find((c: any) => c.key === "site_title")?.value || "Shawn's BLOG";

  const siteQuotesStr = configs?.find((c: any) => c.key === "site_quotes")?.value;
  let siteQuotes: QuoteItem[] = [];
  try {
    if (siteQuotesStr) {
      const raw = JSON.parse(siteQuotesStr);
      siteQuotes = raw.map((item: any) =>
        typeof item === "string" ? { text: item } : item
      );
    }
  } catch (e) { }

  // 3. 后置处理评论数据 (依赖 moments 的 ID)
  const momentIds = moments?.map(m => m.id) || [];
  let allComments: any[] = [];
  if (momentIds.length > 0) {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .in("moment_id", momentIds)
      .order("created_at", { ascending: true });
    if (data) allComments = data;
  }

  const siteStats = stats || { page_views: 0, unique_visitors: 0 };

  return (
    <div className="py-8 px-4 md:px-8 animate-in fade-in duration-700">
      <VisitTracker />
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 items-start">

          {/* 左侧侧边栏 - 在大屏幕固定 */}
          <aside className="hidden lg:block lg:sticky lg:top-20 lg:h-fit">
            <HomeSidebar stats={siteStats} />
          </aside>

          {/* 右侧主内容区 */}
          <div className="space-y-16">
            {/* 移动端侧边栏展示 (显示在 Hero 下方) */}
            <div className="lg:hidden">
              {/* 可以在这里放一个简化版的 Sidebar */}
            </div>

            {/* Hero + 搜索 */}
            <section>
              <HeroSection
                images={heroImages}
                initialImage={heroImage}
                title={siteTitle}
                isAdmin={isAdmin}
              />
              <div className="max-w-md mx-auto -mt-16 relative z-10 px-4">
                <SearchInput defaultValue={query} placeholder="发现花园里的精彩时刻..." />
              </div>
            </section>

            {/* 兼容移动端的 Sidebar (显示在 Hero 之后) */}
            <div className="lg:hidden">
              <HomeSidebar stats={siteStats} />
            </div>

            {/* 句子卡片 */}
            {!query && <QuoteCard quotes={siteQuotes} />}

            {/* 最新笔记 */}
            <section className="space-y-6">
              <SectionHeader
                title="最新笔记"
                actionLabel="写新笔记"
                actionHref="/admin/write"
                showAction={isAdmin}
              />
              <div className="flex flex-col gap-4">
                {posts?.map((post: Post) => (
                  <BlogCard
                    key={post.id}
                    post={post}
                    isAdmin={isAdmin}
                  />
                ))}
                {posts?.length === 0 && (
                  <p className="text-muted-foreground text-center py-10 italic">未找到相关笔记</p>
                )}
              </div>
            </section>

            {/* 社区精选 */}
            <section className="space-y-6">
              <SectionHeader
                title="社区精选"
                actionLabel="去社区看看"
                actionHref="/community"
                showAction={true}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                {moments?.map((item: Moment) => {
                  const momentComments = allComments.filter((c: any) => c.moment_id === item.id);
                  return (
                    <MomentCard
                      key={item.id}
                      id={item.id}
                      content={item.content}
                      created_at={item.created_at}
                      images={item.images}
                      likes={item.likes}
                      comments={momentComments}
                      isAdmin={isAdmin}
                      author={item.author}
                    />
                  );
                })}
                {moments?.length === 0 && (
                  <p className="text-muted-foreground text-center col-span-2 py-10 italic">
                    还没有精选动态
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
