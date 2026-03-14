"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { uploadImage, deleteImageFromUrl, extractImageUrls } from "@/lib/upload";
import type { ActionResult } from "@/lib/types";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

/** 创建文章 */
export async function createPost(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
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

    const userWithProfile = await getCurrentUser();
    if (!userWithProfile) throw new Error("未登录");

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
            author_id: userWithProfile.id,
        },
    ]);

    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/blog");
    return { success: true, slug };
}

/** 更新文章 */
export async function updatePost(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;
    const tagsStr = formData.get("tags") as string;
    const category = formData.get("category") as string;
    const coverFile = formData.get("cover") as File;
    const slug = formData.get("slug") as string;

    // 1. 获取旧数据用于图片对比
    const { data: oldPost } = await supabase
        .from("posts")
        .select("content, cover_image")
        .eq("id", id)
        .single();

    let coverImageUrl: string | undefined;
    if (coverFile && coverFile.size > 0) {
        // 如果有新封面，先上传新封面
        coverImageUrl = await uploadImage(coverFile, "cover");
        // 删除旧封面
        if (oldPost?.cover_image) {
            await deleteImageFromUrl(oldPost.cover_image, supabase);
        }
    }

    // 2. 正文图片对比清理
    if (oldPost && oldPost.content !== content) {
        const oldUrls = extractImageUrls(oldPost.content || "");
        const newUrls = extractImageUrls(content || "");
        // 找出已删除的图片引用
        const discardedUrls = oldUrls.filter(url => !newUrls.includes(url));
        if (discardedUrls.length > 0) {
            await deleteImageFromUrl(discardedUrls, supabase);
        }
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
    const supabase = await createClient();

    // 1. 获取文章信息以删除关联图片
    const { data: post } = await supabase
        .from("posts")
        .select("content, cover_image")
        .eq("id", id)
        .single();

    if (post) {
        const imageUrls = extractImageUrls(post.content || "");
        if (post.cover_image) imageUrls.push(post.cover_image);
        
        // 聚合后一次性删除，效率更高
        if (imageUrls.length > 0) {
            await deleteImageFromUrl(imageUrls, supabase);
        }
    }

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/");
    revalidatePath("/blog");
}

/** 获取所有分类 */
export async function getCategories(): Promise<string[]> {
    const supabase = await createClient();
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
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("posts")
        .select("tags")
        .not("tags", "is", null);

    if (error) return [];
    const allTags = data.flatMap(i => i.tags || []);
    return Array.from(new Set(allTags)).filter(Boolean);
}

/** 同步本地图片到 Supabase (支持绝对和相对路径) */
export async function syncLocalImages(paths: string[], baseDir?: string): Promise<Record<string, string>> {
    const supabase = await createClient();
    const result: Record<string, string> = {};

    for (const localPath of paths) {
        try {
            let targetPath = localPath;

            // 1. 处理相对路径：如果不是绝对路径且提供了 baseDir，则进行拼接
            const isAbsolute = path.isAbsolute(localPath) || /^[a-zA-Z]:/.test(localPath);
            if (!isAbsolute && baseDir) {
                targetPath = path.join(baseDir, localPath);
            }

            // 2. 规范化路径 (处理 file:/// 等)
            targetPath = targetPath.replace(/^file:\/\/\//, '').replace(/\\/g, '/');

            if (!fs.existsSync(targetPath)) {
                // 尝试处理常见的路径转义 (如空格变成 %20)
                const decodedPath = decodeURIComponent(targetPath);
                if (!fs.existsSync(decodedPath)) continue;
                targetPath = decodedPath;
            }
            const fileBuffer = fs.readFileSync(targetPath);
            const baseName = path.basename(targetPath).replace(/[^a-zA-Z0-9.]/g, "");
            const fileName = `sync-${Date.now()}-${baseName || 'image.jpg'}`;
            
            const ext = path.extname(targetPath).toLowerCase();
            const mimeType = ext === '.png' ? 'image/png' : 
                           ext === '.gif' ? 'image/gif' : 
                           ext === '.webp' ? 'image/webp' : 
                           ext === '.svg' ? 'image/svg+xml' : 'image/jpeg';

            const { data, error } = await supabase.storage
                .from("public-images")
                .upload(fileName, fileBuffer, {
                    contentType: mimeType,
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            if (data) {
                const { data: urlData } = supabase.storage
                    .from("public-images")
                    .getPublicUrl(fileName);
                result[localPath] = urlData.publicUrl;
            }
        } catch (e) {
            console.error(`Failed to sync image: ${localPath}`, e);
        }
    }
    return result;
}
