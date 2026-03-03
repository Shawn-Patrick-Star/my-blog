"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { uploadImage } from "@/lib/upload";
import type { ActionResult } from "@/lib/types";

/** 创建文章 */
export async function createPost(formData: FormData): Promise<ActionResult> {
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const tagsStr = formData.get("tags") as string;
    const category = formData.get("category") as string;
    const coverFile = formData.get("cover") as File;

    let slug = formData.get("slug") as string;
    if (!slug) {
        slug = `note-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    }

    let coverImageUrl: string | null = null;
    if (coverFile && coverFile.size > 0) {
        coverImageUrl = await uploadImage(coverFile, "cover");
    }

    const tags = tagsStr ? tagsStr.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [];
    const wordCount = content.length;

    const { error } = await supabase.from("posts").insert([
        {
            title,
            slug,
            content,
            excerpt,
            tags,
            category,
            word_count: wordCount,
            cover_image: coverImageUrl,
            is_published: true,
        },
    ]);

    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/blog");
    return { success: true, slug };
}

/** 更新文章 */
export async function updatePost(formData: FormData): Promise<ActionResult> {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const tagsStr = formData.get("tags") as string;
    const category = formData.get("category") as string;
    const coverFile = formData.get("cover") as File;
    const slug = formData.get("slug") as string;

    let coverImageUrl: string | undefined;
    if (coverFile && coverFile.size > 0) {
        coverImageUrl = await uploadImage(coverFile, "cover");
    }

    const tags = tagsStr ? tagsStr.split(",").filter(Boolean) : [];
    const wordCount = content.length;

    const updateData: Record<string, unknown> = {
        title,
        content,
        excerpt,
        tags,
        category,
        word_count: wordCount,
        updated_at: new Date().toISOString(),
    };

    if (coverImageUrl) {
        updateData.cover_image = coverImageUrl;
    }

    const { error } = await supabase
        .from("posts")
        .update(updateData)
        .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    return { success: true, slug };
}

/** 删除文章 */
export async function deletePost(id: string): Promise<void> {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/");
    revalidatePath("/blog");
}

/** 获取所有分类 */
export async function getCategories(): Promise<string[]> {
    const { data, error } = await supabase
        .from("posts")
        .select("category")
        .not("category", "is", null);

    if (error) return [];
    const cats = data.map(i => i.category);
    return Array.from(new Set(cats)).filter(Boolean);
}

/** 获取所有标签 */
export async function getTags(): Promise<string[]> {
    const { data, error } = await supabase
        .from("posts")
        .select("tags")
        .not("tags", "is", null);

    if (error) return [];
    const allTags = data.flatMap(i => i.tags || []);
    return Array.from(new Set(allTags)).filter(Boolean);
}
