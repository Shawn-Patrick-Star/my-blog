"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/** 更新站点配置（首页背景图、标题等） */
export async function updateSiteConfig(formData: FormData): Promise<void> {
    const heroImageUrl = formData.get("hero_image_url") as string;
    const heroImageFile = formData.get("hero_image") as File;
    const siteTitle = formData.get("site_title") as string;

    // 方案 A：客户端直传的 URL
    if (heroImageUrl) {
        await supabase
            .from("site_config")
            .upsert({ key: "hero_image", value: heroImageUrl }, { onConflict: "key" });
    }
    // 方案 B：服务端中转文件上传（备用）
    else if (heroImageFile && heroImageFile.size > 0) {
        const fileName = `hero-${Date.now()}-${heroImageFile.name}`;
        const { error: uploadError } = await supabase.storage
            .from("public-images")
            .upload(fileName, heroImageFile);

        if (!uploadError) {
            const { data } = supabase.storage.from("public-images").getPublicUrl(fileName);
            await supabase
                .from("site_config")
                .upsert({ key: "hero_image", value: data.publicUrl }, { onConflict: "key" });
        }
    }

    if (siteTitle) {
        await supabase
            .from("site_config")
            .upsert({ key: "site_title", value: siteTitle }, { onConflict: "key" });
    }

    revalidatePath("/");
}
