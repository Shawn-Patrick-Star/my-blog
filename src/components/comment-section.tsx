"use client";

import { useState } from "react";
import { createComment, deleteComment } from "@/lib/actions/interaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { MessageCircle, Trash2, User, Loader2 } from "lucide-react";
import type { Comment } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
    targetId: string;
    targetType: "post" | "moment";
    initialComments?: Comment[];
    isAdmin?: boolean;
    actionButtons?: React.ReactNode;
    startOpen?: boolean;
}

export function CommentSection({
    targetId,
    targetType,
    initialComments = [],
    isAdmin = false,
    actionButtons,
    startOpen = false,
}: CommentSectionProps) {
    const [isPending, setIsPending] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isReplying, setIsReplying] = useState(startOpen);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsPending(true);
        setErrorMsg("");

        const formData = new FormData(e.currentTarget);
        formData.append(targetType === "post" ? "post_id" : "moment_id", targetId);

        try {
            const { success, error } = await createComment(formData);
            if (!success) {
                setErrorMsg(error || "评论失败，请重试");
            } else {
                // Reset form
                (e.target as HTMLFormElement).reset();
                setIsReplying(false);
            }
        } catch (err: any) {
            setErrorMsg(err.message);
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("确定要删除这条评论吗？")) {
            try {
                await deleteComment(id);
            } catch (err: any) {
                alert("删除失败：" + err.message);
            }
        }
    };

    return (
        <div className="mt-12 pt-8 border-t border-border max-w-2xl mx-auto w-full">
            {/* 交互按钮区域：点赞 & 分享 & 评论切换 */}
            {actionButtons && (
                <div className="flex justify-center items-center flex-wrap gap-5 mb-12 pb-12 border-b border-border/60">
                    <div className="flex items-center gap-3 bg-muted/40 p-1.5 rounded-full border border-border/40 shadow-sm transition-all hover:shadow-md">
                        {actionButtons}
                        <Button
                            onClick={() => setIsReplying(r => !r)}
                            className={cn(
                                "gap-2 transition-all rounded-full h-10 px-6 font-bold",
                                isReplying
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                                    : "bg-background text-foreground hover:text-primary hover:bg-accent border border-border/50"
                            )}
                        >
                            <MessageCircle size={18} fill={isReplying ? "currentColor" : "none"} />
                            <span>{isReplying ? "正在评论" : "写评论"}</span>
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-2xl font-black flex items-center gap-3 text-foreground">
                    <MessageCircle className="text-primary w-7 h-7" />
                    互动交流
                    <span className="text-sm font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{initialComments.length}</span>
                </h3>
            </div>

            {/* 发表留言框 */}
            {isReplying && (
                <div className="bg-card/50 backdrop-blur-sm p-6 md:p-8 rounded-[32px] border border-primary/20 shadow-xl shadow-primary/5 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1">留言内容</label>
                            <Textarea
                                name="content"
                                placeholder="分享你的想法或建议..."
                                required
                                maxLength={500}
                                className="min-h-[120px] resize-none bg-background/80 border-border/40 focus-visible:ring-primary/20 rounded-2xl p-4 leading-relaxed font-medium"
                            />
                        </div>
                        {errorMsg && <p className="text-destructive text-sm font-bold bg-destructive/10 p-3 rounded-xl border border-destructive/20">{errorMsg}</p>}
                        <div className="flex justify-end gap-3 pt-2">
                            {(!startOpen || actionButtons) && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsReplying(false)}
                                    className="rounded-full font-bold hover:bg-accent h-11 px-6"
                                >
                                    暂时取消
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-full h-11 px-8 font-black transition-all active:scale-95"
                            >
                                {isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "确认发布留言"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {!isReplying && !actionButtons && (
                <div className="mb-12 text-center">
                    <Button
                        onClick={() => setIsReplying(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-full h-12 px-10 font-black text-lg transition-all hover:scale-105 active:scale-95"
                    >
                        我也来说一句
                    </Button>
                </div>
            )}

            {/* 评论列表 */}
            <div className="space-y-4">
                {initialComments.length > 0 ? (
                    initialComments.map((comment) => (
                        <div
                            key={comment.id}
                            className="group flex gap-3 md:gap-5 p-5 md:p-6 rounded-[28px] hover:bg-card transition-all border border-transparent hover:border-border/60 hover:shadow-sm"
                        >
                            <div className="w-12 h-12 shrink-0 bg-accent rounded-2xl flex items-center justify-center text-muted-foreground border border-border/50 shadow-xs overflow-hidden">
                                {comment.author?.avatar_url ? (
                                    <img
                                        src={comment.author.avatar_url}
                                        alt={comment.author_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User size={24} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/profile/${comment.author_id}`}
                                            className="font-black text-foreground hover:text-primary transition-colors"
                                        >
                                            {comment.author_name}
                                        </Link>
                                        <span className="text-muted-foreground/60 text-[10px] font-bold uppercase tracking-tighter">
                                            {format(new Date(comment.created_at), "yyyy-MM-dd HH:mm")}
                                        </span>
                                    </div>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="text-muted-foreground hover:text-destructive transition-all p-1.5 hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100"
                                            title="删除此评论"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-foreground/90 text-[15px] leading-relaxed wrap-break-word whitespace-pre-wrap font-medium">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-muted/20 rounded-[40px] border-2 border-dashed border-border/60">
                        <div className="mb-4 text-4xl opacity-30 grayscale saturate-0">💬</div>
                        <p className="text-muted-foreground font-bold text-lg">暂无留言，快来抢沙发吧的！</p>
                    </div>
                )}
            </div>
        </div>
    );
}
