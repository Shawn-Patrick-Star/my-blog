"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";
// 建议把密码放到 .env.local 里，这里为了演示方便写死
const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD;

export async function loginAction(prevState: any, formData: FormData) {

    // 现在 formData 是第二个参数，可以正常获取了
    const password = formData.get("password") as string;

    if (password === CORRECT_PASSWORD) {
        // 1. 密码正确，设置 Cookie
        (await cookies()).set(COOKIE_NAME, "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7天免登录
            path: "/",
        });

        // 2. 跳转到后台
        // 注意：redirect 会抛出一个特殊的错误来中断执行，这是正常的，不要 try-catch 它
        redirect("/admin");
    } else {
        // 3. 密码错误，返回新的 state
        return { error: "密码错误，请重试" };
    }
}

export async function logoutAction() {
    (await cookies()).delete(COOKIE_NAME);
    redirect("/login");
}