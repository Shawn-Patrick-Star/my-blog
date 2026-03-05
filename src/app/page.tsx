import { createClient } from "@/utils/supabase/server";
import { checkIsAdmin, getCurrentUser } from "@/lib/auth";
import { HeroSection } from "@/components/hero-section";
import { BlogCard } from "@/components/blog-card";
import { MomentCard } from "@/components/moment-card";
import { SearchInput } from "@/components/search-input";
import { SectionHeader } from "@/components/section-header";
import { QuoteCard } from "@/components/quote-card";
import type { QuoteItem } from "@/components/quote-card";

export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  const userWithProfile = await getCurrentUser();
  const isAdmin = userWithProfile?.profile.role === "admin" || userWithProfile?.profile.role === "super_admin";
  const isUser = !!userWithProfile;

  const supabase = await createClient();

  // 获取首页配置
  const { data: configs } = await supabase
    .from("site_config")
    .select("key, value");

  const heroImage = configs?.find(c => c.key === "hero_image")?.value || "";
  const heroImagesStr = configs?.find(c => c.key === "hero_images")?.value;
  let heroImages: string[] = [];
  try {
    if (heroImagesStr) heroImages = JSON.parse(heroImagesStr);
  } catch (e) { }

  const siteTitle = configs?.find(c => c.key === "site_title")?.value || "Shawn's BLOG";

  const siteQuotesStr = configs?.find(c => c.key === "site_quotes")?.value;
  let siteQuotes: QuoteItem[] = [];
  try {
    if (siteQuotesStr) {
      const raw = JSON.parse(siteQuotesStr);
      // 兼容旧格式: string[] -> QuoteItem[]
      siteQuotes = raw.map((item: any) =>
        typeof item === "string" ? { text: item } : item
      );
    }
  } catch (e) { }

  // 构建查询 (支持搜索)
  let postQuery = supabase
    .from("posts")
    .select("*, author:profiles!author_id(*)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // 首页动态仅显示高赞或最新的前 4 个
  let momentQuery = supabase
    .from("moments")
    .select("*, author:profiles!author_id(*)")
    .order("likes", { ascending: false })
    .order("created_at", { ascending: false });

  if (query) {
    postQuery = postQuery.ilike("title", `%${query}%`);
    momentQuery = momentQuery.ilike("content", `%${query}%`);
  }

  const [{ data: posts }, { data: moments }] = await Promise.all([
    postQuery.limit(5),
    momentQuery.limit(4),
  ]);

  // 获取所有的 comments 用于 moments
  const momentIds = moments?.map(m => m.id) || [];
  let allComments: any[] = [];
  if (momentIds.length > 0) {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .in("moment_id", momentIds)
      .order("created_at", { ascending: false });
    if (data) allComments = data;
  }

  return (
    <div className="py-8 px-4 md:px-8 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto space-y-16">
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
            {posts?.map((post) => (
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
            {moments?.map((item) => {
              const momentComments = allComments.filter(c => c.moment_id === item.id);
              return (
                <MomentCard
                  key={item.id}
                  id={item.id}
                  content={item.content}
                  createdAt={item.created_at}
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
  );
}
