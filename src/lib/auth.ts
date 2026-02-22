import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

/**
 * 检查当前请求是否为已登录的管理员
 * 用于 Server Component 中的权限判断
 */
export async function checkIsAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value === "true";
}
