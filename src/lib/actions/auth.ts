"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_session";
const CORRECT_PASSWORD = process.env.ADMIN_PASSWORD;

/** 登录 */
export async function loginAction(
    prevState: { error: string },
    formData: FormData
): Promise<{ error: string }> {
    const password = formData.get("password") as string;

    if (password === CORRECT_PASSWORD) {
        (await cookies()).set(COOKIE_NAME, "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 天免登录
            path: "/",
        });
        redirect("/admin");
    } else {
        return { error: "密码错误，请重试" };
    }
}

/** 退出登录 */
export async function logoutAction(): Promise<void> {
    (await cookies()).delete(COOKIE_NAME);
    redirect("/login");
}
