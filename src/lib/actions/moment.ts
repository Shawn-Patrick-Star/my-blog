"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { deleteImageFromUrl } from "@/lib/upload";

/** 创建动态 */
export async function createMoment(formData: FormData): Promise<void> {
    const supabase = await createClient();
    const content = formData.get("content") as string;
    const imageUrlsString = formData.get("image_urls") as string;
    const imageUrls = imageUrlsString ? imageUrlsString.split(",") : [];

    if (!content && imageUrls.length === 0) return;

    const userWithProfile = await getCurrentUser();
    if (!userWithProfile) throw new Error("未登录");

    const { error } = await supabase
        .from("moments")
        .insert([{ content, images: imageUrls, author_id: userWithProfile.id }]);

    if (error) throw new Error("发布失败：" + error.message);
    revalidatePath("/");
    revalidatePath("/community");
}

/** 更新动态 (带图片清理) */
export async function updateMoment(formData: FormData): Promise<{ success: boolean }> {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const content = formData.get("content") as string;
    const existingImages = (formData.get("existing_images") as string).split(",").filter(Boolean);
    const newImageUrls = (formData.get("new_image_urls") as string).split(",").filter(Boolean);

    // 1. 获取旧数据以清理不再使用的图片
    const { data: oldMoment } = await supabase
        .from("moments")
        .select("images")
        .eq("id", id)
        .single();

    if (oldMoment?.images) {
        const removedImages = oldMoment.images.filter((img: string) => !existingImages.includes(img));
        for (const imgUrl of removedImages) {
            await deleteImageFromUrl(imgUrl, supabase);
        }
    }

    const finalImages = [...existingImages, ...newImageUrls];

    const { error } = await supabase
        .from("moments")
        .update({ content, images: finalImages })
        .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/");
    revalidatePath("/community");
    return { success: true };
}

/** 删除动态 (同时删除存储中的图片) */
export async function deleteMoment(id: string): Promise<void> {
    const supabase = await createClient();

    // 1. 获取动态图片
    const { data: moment } = await supabase
        .from("moments")
        .select("images")
        .eq("id", id)
        .single();

    if (moment?.images && moment.images.length > 0) {
        for (const url of moment.images) {
            await deleteImageFromUrl(url, supabase);
        }
    }

    const { error } = await supabase.from("moments").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/");
    revalidatePath("/community");
}
