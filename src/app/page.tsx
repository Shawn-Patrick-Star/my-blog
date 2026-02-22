import { supabase } from "@/lib/supabase";
import { checkIsAdmin } from "@/lib/auth";
import { HeroSection } from "@/components/hero-section";
import { BlogCard } from "@/components/blog-card";
import { MomentCard } from "@/components/moment-card";
import { SearchInput } from "@/components/search-input";
import { SectionHeader } from "@/components/section-header";

export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";

  const isAdmin = await checkIsAdmin();

  // 获取首页配置
  const { data: imgConfig } = await supabase
    .from("site_config")
    .select("value")
    .eq("key", "hero_image")
    .single();
  const heroImage = imgConfig?.value || "";

  const { data: titleConfig } = await supabase
    .from("site_config")
    .select("value")
    .eq("key", "site_title")
    .single();
  const siteTitle = titleConfig?.value || "Shawn's BLOG";

  // 构建查询 (支持搜索)
  let postQuery = supabase
    .from("posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  let momentQuery = supabase
    .from("moments")
    .select("*")
    .order("created_at", { ascending: false });

  if (query) {
    postQuery = postQuery.ilike("title", `%${query}%`);
    momentQuery = momentQuery.ilike("content", `%${query}%`);
  }

  const [{ data: posts }, { data: moments }] = await Promise.all([
    postQuery.limit(5),
    momentQuery.limit(10),
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
    <div className="py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Hero + 搜索 */}
        <section>
          <HeroSection
            initialImage={heroImage}
            title={siteTitle}
            isAdmin={isAdmin}
          />
          <div className="max-w-md mx-auto -mt-16 relative z-10 px-4">
            <SearchInput defaultValue={query} />
          </div>
        </section>

        {/* 最新笔记 */}
        <section>
          <SectionHeader
            title="最新笔记"
            accentColor="bg-amber-400"
            actionLabel="写新笔记"
            actionHref="/admin/write"
            actionColorClass="text-amber-600 border-amber-200 hover:bg-amber-50"
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
              <p className="text-zinc-400 text-center py-10">未找到相关笔记</p>
            )}
          </div>
        </section>

        {/* 碎片动态 */}
        <section>
          <SectionHeader
            title="碎片动态"
            accentColor="bg-blue-400"
            actionLabel="发新动态"
            actionHref="/admin/moments"
            actionColorClass="text-blue-600 border-blue-200 hover:bg-blue-50"
            showAction={isAdmin}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                />
              );
            })}
            {moments?.length === 0 && (
              <p className="text-zinc-400 text-center col-span-2 py-10">
                未找到相关动态
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}