"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/** 更新站点配置（首页背景图、标题等） */
export async function updateSiteConfig(formData: FormData): Promise<void> {
    const heroImageUrl = formData.get("hero_image_url") as string;
    const heroImages = formData.get("hero_images") as string; // JSON string
    const siteTitle = formData.get("site_title") as string;
    const siteQuotes = formData.get("site_quotes") as string; // JSON string

    // 1. 旧图兼容 (单图)
    if (heroImageUrl) {
        await supabase
            .from("site_config")
            .upsert({ key: "hero_image", value: heroImageUrl }, { onConflict: "key" });
    }

    // 2. 多图支持 (JSON 数组)
    if (heroImages) {
        await supabase
            .from("site_config")
            .upsert({ key: "hero_images", value: heroImages }, { onConflict: "key" });
    }

    // 3. 网站标题
    if (siteTitle) {
        await supabase
            .from("site_config")
            .upsert({ key: "site_title", value: siteTitle }, { onConflict: "key" });
    }

    // 4. 哲理句子 (JSON 数组)
    if (siteQuotes) {
        await supabase
            .from("site_config")
            .upsert({ key: "site_quotes", value: siteQuotes }, { onConflict: "key" });
    }

    revalidatePath("/");
}
