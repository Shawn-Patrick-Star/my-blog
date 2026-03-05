import { createClient } from "@/utils/supabase/server";

/**
 * 获取当前登录用户及个人资料
 */
export async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return { ...user, profile };
}

/**
 * 检查当前请求是否为管理员权限 (admin 或 super_admin)
 */
export async function checkIsAdmin(): Promise<boolean> {
    const userWithProfile = await getCurrentUser();
    if (!userWithProfile?.profile) return false;
    const role = userWithProfile.profile.role;
    return role === "admin" || role === "super_admin";
}

/**
 * 检查是否为最高管理员
 */
export async function checkIsSuperAdmin(): Promise<boolean> {
    const userWithProfile = await getCurrentUser();
    return userWithProfile?.profile?.role === "super_admin";
}
