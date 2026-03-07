import { createClient } from "@/utils/supabase/server";
import { checkIsAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import "highlight.js/styles/github-dark.css";
import { format } from "date-fns";
import { Hash, FileText, ArrowLeft, User as UserIcon } from "lucide-react";
import { PostAdminActions } from "@/components/post-admin-actions";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import Link from "next/link";
import { LikeButton } from "@/components/like-button";
import { CommentSection } from "@/components/comment-section";
import { ShareButton } from "@/components/share-button";
import { ScrollToTop } from "@/components/scroll-to-top";
import { TableOfContents } from "@/components/table-of-contents";

export const revalidate = 0;

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*, author:profiles!author_id(*)")
    .eq("slug", slug)
    .single();
  if (!post) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", post.id)
    .order("created_at", { ascending: false });

  const isAdmin = await checkIsAdmin();

  const hasCover = !!post.cover_image;

  return (
    <div className="w-full">
      {/* 顶部标题（无封面图时） */}
      {!hasCover && (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-12 pb-8">
          <h1 className="font-fredoka text-4xl md:text-5xl font-bold mb-6 text-foreground text-balance">
            {post.title}
          </h1>
        </div>
      )}

      {/* 主体布局 */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 relative">
        {/* 封面图（与内容同宽） */}
        {hasCover && (
          <div className="w-full mb-8 lg:mb-12">
            <div className="relative w-full h-[45vh] min-h-[350px] rounded-2xl overflow-hidden shadow-sm border border-border">
              <img
                src={post.cover_image}
                alt="cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
              {/* 标题移到左下角，使用 Fredoka 字体 */}
              <div className="absolute bottom-10 left-8 lg:bottom-16 lg:left-16 max-w-4xl z-10">
                <h1 className="font-fredoka text-3xl md:text-5xl font-bold text-white drop-shadow-xl text-balance">
                  {post.title}
                </h1>
              </div>
            </div>
          </div>
        )}

        {/* 页面主体包裹层，分成分块加载以控制 Sticky 范围 */}
        <div className="flex flex-col gap-8">
          {/* 第一部分：左侧目录卡片 + 右侧正文区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
            {/* 左侧目录卡片 - 只在桌面显示，吸顶 */}
            <div className="hidden lg:block sticky top-24 self-start">
              <div className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-6">
                {/* 返回链接 */}
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group font-medium w-full"
                >
                  <ArrowLeft
                    size={16}
                    className="group-hover:-translate-x-0.5 transition-transform"
                  />
                  返回笔记
                </Link>

                {/* 目录组件 */}
                <TableOfContents />
              </div>
            </div>

            {/* 右侧正文区域 */}
            <div className="min-w-0 w-full space-y-8">
              {/* 移动端返回链接 */}
              <div className="lg:hidden">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group font-medium"
                >
                  <ArrowLeft
                    size={16}
                    className="group-hover:-translate-x-0.5 transition-transform"
                  />
                  返回笔记
                </Link>
              </div>

              {/* 文章卡片（不含评论） */}
              <article className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border transition-all">
                {/* 卡片顶部元数据信息 */}
                <header className="p-6 md:p-10 lg:p-12 pb-6 md:pb-8 border-b border-border/60">
                  {/* 使用 grid 布局精确控制 */}
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
                    {/* 左侧文字区域 */}
                    <div className="space-y-4">
                      {/* 第一行：日期和字数 - 使用 flex 确保在一行 */}
                      <div className="flex items-center flex-wrap gap-4 text-muted-foreground text-sm font-medium">
                        <time dateTime={post.created_at}>
                          发布于 {format(new Date(post.created_at), "yyyy-MM-dd")}
                        </time>
                        {post.word_count > 0 && (
                          <>
                            <span className="opacity-50">•</span>
                            <span className="flex items-center gap-1.5">
                              <FileText size={14} /> {post.word_count} 字
                            </span>
                          </>
                        )}
                      </div>

                      {/* 第二行：标签 */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag: string) => (
                            <span key={tag} className="px-2.5 py-1 bg-accent text-accent-foreground text-xs rounded-md border border-border font-medium tracking-wide uppercase">
                              <Hash size={12} className="inline mr-1 opacity-50" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 右侧图标 - 固定在右上角，与第一行对齐 */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 md:mt-0 md:self-start">
                        <PostAdminActions postId={post.id} />
                      </div>
                    )}
                  </div>
                </header>

                {/* Markdown 正文 */}
                <div className="p-6 md:p-10 lg:p-12">
                  <MarkdownRenderer content={post.content} />
                </div>

              </article>
            </div>
          </div>

          {/* 第二部分：评论区 (独立布局，脱离目录所在的容器，使目录只跟正文对齐) */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
            <div className="hidden lg:block"></div> {/* 左侧留白以保持右侧对齐 */}
            <div className="min-w-0 w-full">
              {/* 评论区独立卡片 */}
              <div id="comments" className="bg-card text-card-foreground rounded-2xl shadow-sm border border-border p-6 md:p-8">
                <CommentSection
                  targetId={post.id}
                  targetType="post"
                  initialComments={comments || []}
                  isAdmin={isAdmin}
                  actionButtons={(
                    <>
                      <LikeButton
                        targetId={post.id}
                        targetType="post"
                        initialLikes={post.likes || 0}
                      />
                      <ShareButton title={post.title} />
                    </>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ScrollToTop />
    </div>
  );
}