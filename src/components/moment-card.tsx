"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { Trash2, Edit3, MessageCircle, Loader2, User as UserIcon } from "lucide-react";
import { deleteMoment } from "@/lib/actions/moment";
import { createComment } from "@/lib/actions/interaction";
import Link from "next/link";
import { LikeButton } from "@/components/like-button";
import type { Comment, Profile } from "@/lib/types";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MomentCardProps {
  id?: string;
  content: string;
  created_at: string;
  images?: string[];
  likes?: number;
  comments?: Comment[];
  isAdmin?: boolean;
  author?: Profile;
  align?: 'left' | 'right';
}

export function MomentCard({
  id,
  content,
  created_at,
  images,
  likes = 0,
  comments = [],
  isAdmin,
  author,
  align = 'left',
}: MomentCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!id) return;
    if (confirm("确定要删除这条动态吗？")) {
      try {
        await deleteMoment(id);
      } catch (err: any) {
        alert("删除失败: " + err.message);
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    formData.append("moment_id", id);
    try {
      const { success, error } = await createComment(formData);
      if (success) {
        setIsReplying(false);
        formRef.current?.reset();
        setIsExpanded(true); // show all after comment
      } else {
        alert(error || "评论失败");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPending(false);
    }
  };

  const isRight = align === 'right';

  return (
    <div className={cn(
      "flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500",
      "mb-6 pb-6 border-b border-border/40 last:border-0 last:mb-0 last:pb-0"
    )}>
      <div className={cn(
        "flex w-full gap-2",
        isRight ? "flex-row-reverse" : "flex-row"
      )}>
        {/* 头像区域 - 独立出来 */}
        <div className="shrink-0 pt-1">
          <Link
            href={`/profile/${author?.id}`}
            className="h-12 w-12 rounded-2xl bg-accent border-2 border-background shadow-sm flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all"
          >
            {author?.avatar_url ? (
              <img src={author.avatar_url} alt={author.username} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={24} className="text-muted-foreground" />
            )}
          </Link>
        </div>

        {/* 消息气泡整体 */}
        <div className={cn(
          "flex flex-col max-w-[75%] md:max-w-[65%] lg:max-w-[50%]",
          isRight ? "items-end" : "items-start"
        )}>
          {/* 用户名和标签 - 位于气泡上方 */}
          <div className={cn(
            "flex items-center gap-2 mb-2 px-1",
            isRight ? "flex-row-reverse" : "flex-row"
          )}>
            <span className="text-sm font-bold text-foreground/90">{author?.username || "未知用户"}</span>
            {author?.role === "super_admin" && (
              <span className="text-[12px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black">园长</span>
            )}
            {author?.role === "admin" && (
              <span className="text-[12px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-black">管理</span>
            )}
            <span className="text-[14px] text-muted-foreground opacity-60">
              {created_at ? format(new Date(created_at), "MM-dd HH:mm") : "未知时间"}
            </span>
          </div>

          {/* 气泡正文 */}
          <div className={cn(
            "relative group p-3 md:p-4 rounded-3xl shadow-sm border transition-all bg-card text-foreground border-border hover:shadow-md",
            isRight ? "rounded-tr-none" : "rounded-tl-none"
          )}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {content}
            </p>

            {images && images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2 w-fit">
                {images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt="moment"
                    className="rounded-xl object-cover w-20 h-20 md:w-24 md:h-24 aspect-square border border-black/5"
                  />
                ))}
              </div>
            )}

            {/* 操作区：点赞、评论按钮 */}
            <div className="mt-4 flex items-center justify-start gap-3">
              {id && (
                <LikeButton
                  targetId={id}
                  targetType="moment"
                  initialLikes={likes}
                  isSmall
                />
              )}
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-[12px] px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5 font-bold border bg-muted/50 border-border/50 text-muted-foreground hover:bg-accent hover:text-primary"
              >
                <MessageCircle size={14} /> 评论
              </button>

              {/* 管理员/作者本人 删除按钮 */}
              {(isAdmin || (author && author.id === id)) && id && (
                <button
                  onClick={handleDelete}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-50/50 text-destructive"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* 紧凑版评论列表 - 放在气泡内底部 */}
            {comments.length > 0 && (
              <div className="mt-4 p-3 rounded-2xl border bg-muted/30 border-border/10 space-y-2">
                {(isExpanded ? comments : comments.slice(0, 2)).map((comment) => (
                  <div key={comment.id} className="text-[13px] flex gap-2">
                    <span className="font-bold shrink-0 text-foreground">{comment.author_name}:</span>
                    <span className="wrap-break-word text-muted-foreground leading-relaxed">{comment.content}</span>
                  </div>
                ))}
                {comments.length > 2 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-[12px] font-black mt-1 ml-1 text-primary hover:text-primary/90"
                  >
                    {isExpanded ? "收起评论" : `展开全部 ${comments.length} 条评论`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 回复输入框 - 气泡下方 */}
          {isReplying && id && (
            <form ref={formRef} onSubmit={handleCommentSubmit} className="mt-3 w-full flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <input
                name="content"
                placeholder="发表你的看法..."
                required
                maxLength={200}
                className="flex-1 px-4 py-2 text-sm rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background/50 text-foreground transition-all"
              />
              <Button
                type="submit"
                disabled={isPending}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-4 h-auto py-2 font-bold"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "发送"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}