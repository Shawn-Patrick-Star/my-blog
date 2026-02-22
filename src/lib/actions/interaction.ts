"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/** 点赞文章 */
export async function likePost(postId: string): Promise<void> {
    const { data, error: selectError } = await supabase
        .from("posts")
        .select("likes")
        .eq("id", postId)
        .single();

    if (selectError) throw new Error(selectError.message);

    const currentLikes = data?.likes || 0;

    const { error: updateError } = await supabase
        .from("posts")
        .update({ likes: currentLikes + 1 })
        .eq("id", postId);

    if (updateError) throw new Error(updateError.message);

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/[slug]`, "page");
}

/** 点赞动态 */
export async function likeMoment(momentId: string): Promise<void> {
    const { data, error: selectError } = await supabase
        .from("moments")
        .select("likes")
        .eq("id", momentId)
        .single();

    if (selectError) throw new Error(selectError.message);

    const currentLikes = data?.likes || 0;

    const { error: updateError } = await supabase
        .from("moments")
        .update({ likes: currentLikes + 1 })
        .eq("id", momentId);

    if (updateError) throw new Error(updateError.message);

    revalidatePath("/");
    revalidatePath("/admin/moments/[id]", "page");
}

/** 添加评论 */
export async function createComment(formData: FormData): Promise<{ success: boolean; error?: string }> {
    try {
        const authorName = formData.get("author_name") as string;
        const content = formData.get("content") as string;
        const postId = formData.get("post_id") as string | null;
        const momentId = formData.get("moment_id") as string | null;

        if (!authorName.trim() || !content.trim()) {
            return { success: false, error: "昵称和评论内容不能为空" };
        }
        if (!postId && !momentId) {
            return { success: false, error: "缺少目标 ID" };
        }

        const payload: any = {
            author_name: authorName.trim(),
            content: content.trim(),
        };

        if (postId) payload.post_id = postId;
        if (momentId) payload.moment_id = momentId;

        const { error } = await supabase.from("comments").insert([payload]);

        if (error) throw new Error(error.message);

        revalidatePath("/");
        revalidatePath("/blog");
        revalidatePath(`/blog/[slug]`, "page");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/** 删除评论 (仅管理员) */
export async function deleteComment(id: string): Promise<void> {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/");
    revalidatePath(`/blog/[slug]`, "page");
}
