import { createClient } from "@/utils/supabase/server";

/**
 * 获取当前登录用户及个人资料
 * 网络错误时返回 null，不会导致页面崩溃
 */
export async function getCurrentUser() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return null;
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        return { ...user, profile };
    } catch (err: any) {
        // 网络超时 / ECONNRESET / TLS 失败等
        const msg = err?.cause?.code || err?.message || 'unknown';
        console.warn(`[auth] getCurrentUser failed: ${msg}`);
        return null;
    }
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
