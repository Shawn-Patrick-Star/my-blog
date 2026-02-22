"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/** 创建动态 */
export async function createMoment(formData: FormData): Promise<void> {
    const content = formData.get("content") as string;
    const imageUrlsString = formData.get("image_urls") as string;
    const imageUrls = imageUrlsString ? imageUrlsString.split(",") : [];

    if (!content && imageUrls.length === 0) return;

    const { error } = await supabase
        .from("moments")
        .insert([{ content, images: imageUrls }]);

    if (error) throw new Error("发布失败：" + error.message);
    revalidatePath("/");
}

/** 更新动态 */
export async function updateMoment(formData: FormData): Promise<{ success: boolean }> {
    const id = formData.get("id") as string;
    const content = formData.get("content") as string;
    const existingImages = (formData.get("existing_images") as string).split(",").filter(Boolean);
    const newImageUrls = (formData.get("new_image_urls") as string).split(",").filter(Boolean);

    const finalImages = [...existingImages, ...newImageUrls];

    const { error } = await supabase
        .from("moments")
        .update({ content, images: finalImages })
        .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/");
    return { success: true };
}

/** 删除动态 */
export async function deleteMoment(id: string): Promise<void> {
    const { error } = await supabase.from("moments").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/");
}
