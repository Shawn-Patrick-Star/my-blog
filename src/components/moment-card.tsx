"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { Trash2, Edit3 } from "lucide-react";
import { deleteMoment } from "@/lib/actions/moment";
import { createComment } from "@/lib/actions/interaction";
import Link from "next/link";
import { LikeButton } from "@/components/like-button";
import type { Comment } from "@/lib/types";
import { useState, useRef } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MomentCardProps {
  id?: string;
  content: string;
  createdAt: string;
  images?: string[];
  likes?: number;
  comments?: Comment[];
  isAdmin?: boolean;
}

export function MomentCard({
  id,
  content,
  createdAt,
  images,
  likes = 0,
  comments = [],
  isAdmin,
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

  return (
    <Card className="w-full border-border shadow-sm hover:shadow-md transition-shadow bg-card group relative dark:bg-zinc-900 dark:border-zinc-800">
      <CardHeader className="flex flex-row items-center gap-3 p-4 pb-2">
        <div className="h-10 w-10 rounded-full bg-accent border border-border flex items-center justify-center font-bold text-primary text-sm dark:bg-amber-900/30 dark:border-amber-900/50">
          Me
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground dark:text-zinc-200">我的动态</span>
          <span className="text-xs text-muted-foreground dark:text-zinc-500">
            {format(new Date(createdAt), "yyyy-MM-dd HH:mm")}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap mb-2 dark:text-zinc-300">
          {content}
        </p>

        {images && images.length > 0 && (
          <div
            className={`mt-3 grid gap-2 ${images.length === 1
              ? "grid-cols-1"
              : images.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
              }`}
          >
            {images.map((url, index) => (
              <img
                key={index}
                src={url}
                alt="moment"
                className="rounded-lg object-cover w-full aspect-square"
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          {id && <LikeButton targetId={id} targetType="moment" initialLikes={likes} isSmall />}
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="text-xs text-muted-foreground hover:text-primary px-3 py-1.5 rounded-full hover:bg-accent transition-colors flex items-center gap-1 border border-transparent hover:border-border dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-amber-500"
          >
            <MessageCircle size={14} /> 评论
          </button>
        </div>

        {/* 紧凑版评论列表 */}
        {comments.length > 0 && (
          <div className="mt-3 bg-muted/40 p-3 rounded-xl border border-border space-y-2 dark:bg-zinc-800/30 dark:border-zinc-700/50">
            {(isExpanded ? comments : comments.slice(0, 2)).map((comment) => (
              <div key={comment.id} className="text-sm">
                <span className="font-semibold text-foreground dark:text-zinc-300 mr-2">{comment.author_name}:</span>
                <span className="text-muted-foreground dark:text-zinc-400 wrap-break-word">{comment.content}</span>
              </div>
            ))}
            {comments.length > 2 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-primary hover:text-primary/80 font-medium mt-1 dark:text-amber-500"
              >
                {isExpanded ? "收起" : `展开全部 ${comments.length} 条评论`}
              </button>
            )}
          </div>
        )}

        {/* 回复输入框 */}
        {isReplying && id && (
          <form ref={formRef} onSubmit={handleCommentSubmit} className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <input
              name="author_name"
              placeholder="昵称"
              required
              maxLength={20}
              className="w-24 px-3 py-1.5 text-sm rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary bg-background dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
            />
            <input
              name="content"
              placeholder="说点什么..."
              required
              maxLength={200}
              className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary bg-background dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200"
            />
            <Button
              type="submit"
              disabled={isPending}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-4 h-auto py-1.5"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "发送"}
            </Button>
          </form>
        )}
      </CardContent>

      {/* 管理员操作组 */}
      {isAdmin && id && (
        <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-all">
          <Link
            href={`/admin/moments/${id}`}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Edit3 size={18} />
          </Link>
          <button
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </Card>
  );
}