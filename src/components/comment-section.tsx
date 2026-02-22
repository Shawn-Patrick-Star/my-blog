"use client";

import { useState } from "react";
import { createComment, deleteComment } from "@/lib/actions/interaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { MessageCircle, Trash2, User, Loader2 } from "lucide-react";
import type { Comment } from "@/lib/types";

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
        <div className="mt-12 pt-8 border-t border-amber-100 max-w-2xl mx-auto w-full">
            {/* 顶部的交互按钮区 */}
            {actionButtons && (
                <div className="flex justify-center flex-wrap gap-4 mb-10 pb-10 border-b border-amber-100">
                    {actionButtons}
                    <Button
                        variant="outline"
                        onClick={() => setIsReplying(r => !r)}
                        className="gap-2 transition-all shadow-sm rounded-full text-zinc-500 hover:text-amber-600 hover:bg-amber-50/50 hover:border-amber-200 border-zinc-200"
                    >
                        <MessageCircle size={18} />
                        <span>写评论</span>
                    </Button>
                </div>
            )}

            <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-800 mb-8" id="comments">
                <MessageCircle className="text-amber-500" size={24} />
                评论区 ({initialComments.length})
            </h3>

            {/* 发表留言框 */}
            {isReplying ? (
                <div className="bg-[#fffef9] p-5 rounded-2xl border border-amber-100 shadow-sm mb-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">你的昵称</label>
                            <Input
                                name="author_name"
                                placeholder="怎么称呼你？"
                                required
                                maxLength={20}
                                className="bg-white border-amber-100 focus-visible:ring-amber-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">留言内容</label>
                            <Textarea
                                name="content"
                                placeholder="说点什么吧..."
                                required
                                maxLength={500}
                                className="min-h-[100px] resize-none bg-white border-amber-100 focus-visible:ring-amber-200"
                            />
                        </div>
                        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
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
                                className="bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-100/50"
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
                        className="bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-100/50 rounded-full px-8"
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
                            className="group flex gap-4 p-4 rounded-xl hover:bg-amber-50/50 transition-colors border border-transparent hover:border-amber-100"
                        >
                            <div className="w-10 h-10shrink-0 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 border border-zinc-200/60">
                                <User size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-zinc-800 text-sm">
                                            {comment.author_name}
                                        </span>
                                        <span className="text-zinc-400 text-xs">
                                            {format(new Date(comment.created_at), "yyyy-MM-dd HH:mm")}
                                        </span>
                                    </div>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            title="删除评论"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-zinc-600 text-sm leading-relaxed break-words whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-zinc-400 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
                        暂无留言，快来抢沙发吧的！
                    </div>
                )}
            </div>
        </div>
    );
}
