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
            {/* 顶部的交互按钮区 */}
            {actionButtons && (
                <div className="flex justify-center flex-wrap gap-4 mb-10 pb-10 border-b border-border">
                    {actionButtons}
                    <Button
                        variant="outline"
                        onClick={() => setIsReplying(r => !r)}
                        className="gap-2 transition-all shadow-sm rounded-full text-muted-foreground hover:text-primary hover:bg-accent hover:border-border border-border"
                    >
                        <MessageCircle size={18} />
                        <span>写评论</span>
                    </Button>
                </div>
            )}

            <h3 className="text-xl font-bold flex items-center gap-2 text-foreground mb-8">
                <MessageCircle className="text-primary" size={24} />
                评论区 ({initialComments.length})
            </h3>

            {/* 发表留言框 */}
            {isReplying ? (
                <div className="bg-card p-5 rounded-2xl border border-border shadow-sm mb-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">你的昵称</label>
                            <Input
                                name="author_name"
                                placeholder="怎么称呼你？"
                                required
                                maxLength={20}
                                className="bg-background border-border focus-visible:ring-ring"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">留言内容</label>
                            <Textarea
                                name="content"
                                placeholder="说点什么吧..."
                                required
                                maxLength={500}
                                className="min-h-[100px] resize-none bg-background border-border focus-visible:ring-ring"
                            />
                        </div>
                        {errorMsg && <p className="text-destructive text-sm">{errorMsg}</p>}
                        <div className="flex justify-end gap-2 pt-2">
                            {(!startOpen || actionButtons) && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsReplying(false)}
                                >
                                    取消
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
                            >
                                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {isPending ? "发表中..." : "发表留言"}
                            </Button>
                        </div>
                    </form>
                </div>
            ) : actionButtons ? null : (
                <div className="mb-10 text-center">
                    <Button
                        onClick={() => setIsReplying(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 rounded-full px-8"
                    >
                        我也来说一句
                    </Button>
                </div>
            )}

            {/* 评论列表 */}
            <div className="space-y-6">
                {initialComments.length > 0 ? (
                    initialComments.map((comment) => (
                        <div
                            key={comment.id}
                            className="group flex gap-4 p-4 rounded-xl hover:bg-accent transition-colors border border-transparent hover:border-border"
                        >
                            <div className="w-10 h-10 shrink-0 bg-secondary rounded-full flex items-center justify-center text-muted-foreground border border-border">
                                <User size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/profile/${comment.author_id}`}
                                            className="font-semibold text-foreground text-sm hover:text-primary transition-colors"
                                        >
                                            {comment.author_name}
                                        </Link>
                                        <span className="text-muted-foreground text-xs">
                                            {format(new Date(comment.created_at), "yyyy-MM-dd HH:mm")}
                                        </span>
                                    </div>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                            title="删除评论"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-foreground/80 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-muted-foreground bg-secondary/50 rounded-xl border border-dashed border-border">
                        暂无留言，快来抢沙发吧的！
                    </div>
                )}
            </div>
        </div>
    );
}
