"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

/** 点赞文章 */
export async function likePost(postId: string): Promise<void> {
    const supabase = await createClient();
    const userWithProfile = await getCurrentUser();

    // 乐观增加点赞数
    const { data: post, error: selectError } = await supabase
        .from("posts")
        .select("likes, author_id")
        .eq("id", postId)
        .single();

    if (selectError) throw new Error(selectError.message);

    const { error: updateError } = await supabase
        .from("posts")
        .update({ likes: (post.likes || 0) + 1 })
        .eq("id", postId);

    if (updateError) throw new Error(updateError.message);

    // 触发通知 (如果点赞者不是作者自己)
    if (userWithProfile && post.author_id && userWithProfile.id !== post.author_id) {
        await supabase.from("notifications").insert([{
            user_id: post.author_id,
            type: 'like',
            from_user_id: userWithProfile.id,
            target_id: postId
        }]);
    }

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/[slug]`, "page");
}

/** 点赞动态 */
export async function likeMoment(momentId: string): Promise<void> {
    const supabase = await createClient();
    const userWithProfile = await getCurrentUser();

    const { data: moment, error: selectError } = await supabase
        .from("moments")
        .select("likes, author_id")
        .eq("id", momentId)
        .single();

    if (selectError) throw new Error(selectError.message);

    const { error: updateError } = await supabase
        .from("moments")
        .update({ likes: (moment.likes || 0) + 1 })
        .eq("id", momentId);

    if (updateError) throw new Error(updateError.message);

    // 触发通知
    if (userWithProfile && moment.author_id && userWithProfile.id !== moment.author_id) {
        await supabase.from("notifications").insert([{
            user_id: moment.author_id,
            type: 'like',
            from_user_id: userWithProfile.id,
            target_id: momentId
        }]);
    }

    revalidatePath("/");
    revalidatePath("/community");
    revalidatePath("/admin/moments/[id]", "page");
}

/** 添加评论 */
export async function createComment(formData: FormData): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient();
        const userWithProfile = await getCurrentUser();
        if (!userWithProfile) {
            return { success: false, error: "请先登录后再发表评论" };
        }

        const content = formData.get("content") as string;
        const postId = formData.get("post_id") as string | null;
        const momentId = formData.get("moment_id") as string | null;

        if (!content.trim()) {
            return { success: false, error: "评论内容不能为空" };
        }

        const payload: any = {
            author_id: userWithProfile.id,
            author_name: userWithProfile.profile.username,
            content: content.trim(),
        };

        if (postId) payload.post_id = postId;
        if (momentId) payload.moment_id = momentId;

        const { error } = await supabase.from("comments").insert([payload]);
        if (error) throw new Error(error.message);

        // 触发通知给文章作者
        let targetOwnerId: string | undefined;
        if (postId) {
            const { data } = await supabase.from("posts").select("author_id").eq("id", postId).single();
            targetOwnerId = data?.author_id;
        } else if (momentId) {
            const { data } = await supabase.from("moments").select("author_id").eq("id", momentId).single();
            targetOwnerId = data?.author_id;
        }

        if (targetOwnerId && targetOwnerId !== userWithProfile.id) {
            await supabase.from("notifications").insert([{
                user_id: targetOwnerId,
                type: 'comment',
                from_user_id: userWithProfile.id,
                target_id: (postId || momentId) as string
            }]);
        }

        revalidatePath("/");
        revalidatePath("/blog");
        revalidatePath("/community");
        revalidatePath(`/blog/[slug]`, "page");
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/** 删除评论 (仅管理员) */
export async function deleteComment(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/");
    revalidatePath("/community");
    revalidatePath(`/blog/[slug]`, "page");
}
