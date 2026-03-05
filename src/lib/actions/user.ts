"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser, checkIsSuperAdmin } from "@/lib/auth";

/** 更新用户信息 */
export async function updateProfileAction(
    prevState: { success: boolean; error: string } | null,
    formData: FormData
): Promise<{ success: boolean; error: string }> {
    const userWithProfile = await getCurrentUser();
    if (!userWithProfile) return { success: false, error: "未登录" };

    const username = formData.get("username") as string;
    const avatarUrl = formData.get("avatar_url") as string;

    const supabase = await createClient();

    // 检查用户名变更限制 (30天)
    if (username !== userWithProfile.profile.username) {
        const lastChanged = new Date(userWithProfile.profile.username_last_changed);
        const now = new Date();
        const diffDays = Math.ceil((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return { success: false, error: `用户名 30 天内只能修改一次，还剩 ${30 - diffDays} 天` };
        }

        // 检查用户名唯一性
        const { data: existing } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", username)
            .maybeSingle();

        if (existing && existing.id !== userWithProfile.id) {
            return { success: false, error: "用户名已存在" };
        }
    }

    const { error } = await supabase
        .from("profiles")
        .update({
            username: username,
            avatar_url: avatarUrl,
            username_last_changed: username !== userWithProfile.profile.username ? new Date().toISOString() : userWithProfile.profile.username_last_changed
        })
        .eq("id", userWithProfile.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/profile");
    revalidatePath("/");
    return { success: true, error: "" };
}

/** 更改密码 */
export async function updatePasswordAction(
    prevState: { success: boolean; error: string } | null,
    formData: FormData
): Promise<{ success: boolean; error: string }> {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (password !== confirmPassword) {
        return { success: false, error: "两次输入的密码不一致" };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) return { success: false, error: error.message };

    return { success: true, error: "" };
}

/** 更新用户角色 (仅限超级管理员) */
export async function updateUserRoleAction(
    userId: string,
    role: "admin" | "user"
): Promise<{ success: boolean; error: string }> {
    const isSuper = await checkIsSuperAdmin();
    if (!isSuper) return { success: false, error: "权限不足" };

    const supabase = await createClient();
    const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/users");
    return { success: true, error: "" };
}
