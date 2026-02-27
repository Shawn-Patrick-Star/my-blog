import { supabase } from "@/lib/supabase";
import { checkIsAdmin } from "@/lib/auth";
import { notFound } from "next/navigation";
import "highlight.js/styles/github-dark.css";
import { format } from "date-fns";
import { Hash, FileText, ArrowLeft } from "lucide-react";
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

  const { data: post } = await supabase
    .from("posts")
    .select("*")
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

        {/* 两列布局：左侧目录卡片 + 右侧内容卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* 左侧目录卡片 - 只在桌面显示 */}
          <div className="hidden lg:block sticky top-24">
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

          {/* 右侧内容区域 */}
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex flex-col gap-4">
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
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-accent text-accent-foreground text-xs rounded-md border border-border font-medium tracking-wide uppercase"
                          >
                            <Hash size={12} className="inline mr-1 opacity-50" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="shrink-0 bg-background/50 p-2 rounded-xl backdrop-blur-sm border border-border">
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

      <ScrollToTop />
    </div>
  );
}