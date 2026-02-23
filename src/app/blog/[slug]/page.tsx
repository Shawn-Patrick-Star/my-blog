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

  return (
    <article className="max-w-3xl mx-auto py-10 px-4">
      {/* 返回按钮 */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-amber-600 transition-colors mb-8 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        返回笔记列表
      </Link>

      {/* 文章头部 */}
      <header className="mb-12 text-center relative">
        {isAdmin && (
          <div className="absolute top-0 right-0">
            <PostAdminActions postId={post.id} />
          </div>
        )}

        <h1 className="text-4xl font-extrabold tracking-tight mb-6 text-zinc-900 mt-4">
          {post.title}
        </h1>

        <div className="flex items-center justify-center gap-4 text-zinc-500 text-sm mb-6">
          <time dateTime={post.created_at}>
            发布于 {format(new Date(post.created_at), "yyyy年MM月dd日")}
          </time>
          {post.word_count > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FileText size={14} /> {post.word_count} 字
              </span>
            </>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-amber-50 text-amber-600 text-sm rounded-full flex items-center gap-1 border border-amber-100"
              >
                <Hash size={12} /> {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* 封面图 */}
      {post.cover_image && (
        <div className="w-full h-64 md:h-96 relative rounded-2xl overflow-hidden mb-12 shadow-sm border border-amber-100/50">
          <img
            src={post.cover_image}
            className="object-cover w-full h-full"
            alt="cover"
          />
        </div>
      )}

      {/* Markdown 内容 */}
      <div className="pb-20">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* 评论区与底部交互按钮 */}
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

      <ScrollToTop />
    </article>
  );
}