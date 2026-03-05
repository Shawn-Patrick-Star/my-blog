"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

/** 追踪访问量 */
export async function trackVisitAction() {
    const supabase = await createClient();
    const cookieStore = await cookies();

    // 检查是否有访客标记
    const hasVisited = (await cookieStore).get("visitor_token");

    // 增加总访问量
    const { data: stats } = await supabase
        .from("site_stats")
        .select("page_views, unique_visitors")
        .eq("id", 1)
        .single();

    if (!stats) return;

    const updateData: any = {
        page_views: stats.page_views + 1,
        last_updated: new Date().toISOString()
    };

    // 如果没有标记，过增加访客数并设置 cookie (有效期 24 小时)
    if (!hasVisited) {
        updateData.unique_visitors = stats.unique_visitors + 1;
        (await cookieStore).set("visitor_token", "true", { maxAge: 60 * 60 * 24 });
    }

    await supabase
        .from("site_stats")
        .update(updateData)
        .eq("id", 1);

    revalidatePath("/");
}
