"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

/** 登录 */
export async function loginAction(
    prevState: { error: string } | null,
    formData: FormData
): Promise<{ error: string } | any> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: "登录失败: " + error.message };
    }

    redirect("/");
}

/** 注册 */
export async function registerAction(
    prevState: { error: string } | null,
    formData: FormData
): Promise<{ error: string } | any> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const username = formData.get("username") as string;

    if (!username || username.length < 3) {
        return { error: "用户名至少 3 个字符" };
    }

    const supabase = await createClient();

    // 检查用户名是否已存在
    const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

    if (existingUser) {
        return { error: "用户名已存在" };
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: username,
            },
        },
    });

    if (error) {
        return { error: "注册失败: " + error.message };
    }

    return redirect("/login?msg=REGISTER_SUCCESS");
}

/** 退出登录 */
export async function logoutAction(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}
