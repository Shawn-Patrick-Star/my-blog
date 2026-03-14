import { supabase } from "@/lib/supabase";

const BUCKET_NAME = "public-images";

/**
 * 上传文件到 Supabase Storage，返回公开 URL
 * @param file - 要上传的文件
 * @param prefix - 文件名前缀（如 "cover"、"body"、"moment"、"hero"）
 */
export async function uploadImage(file: File, prefix: string): Promise<string> {
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "");
    const fileName = `${prefix}-${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file);

    if (error) {
        throw new Error(`图片上传失败: ${error.message}`);
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return data.publicUrl;
}

/**
 * 上传已压缩的 Blob/File 到 Supabase Storage
 * 用于客户端已经压缩过的图片
 */
export async function uploadBlob(
    blob: Blob | File,
    prefix: string,
    extension?: string
): Promise<string> {
    const ext = extension || "jpg";
    const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, blob);

    if (error) {
        throw new Error(`图片上传失败: ${error.message}`);
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return data.publicUrl;
}

/**
 * 助手函数：从 URL 中提取 Storage 的相对路径（文件名）
 */
export function getFilePathFromUrl(url: string | null | undefined): string | null {
    if (!url || !url.includes(BUCKET_NAME)) return null;
    try {
        // 分割并找到 bucket 名称后面的部分
        const parts = url.split(`${BUCKET_NAME}/`);
        if (parts.length < 2) return null;
        // 去掉可能存在的查询参数
        return parts[1].split('?')[0];
    } catch (e) {
        return null;
    }
}

/**
 * 从 URL 列表或单个 URL 中删除图片
 */
export async function deleteImageFromUrl(
    url: string | string[] | null | undefined,
    supabaseClient?: any
) {
    if (!url) return;
    const client = supabaseClient || supabase;
    const urls = Array.isArray(url) ? url : [url];
    
    // 提取所有合法的文件路径
    const filePaths = urls
        .map(u => getFilePathFromUrl(u))
        .filter((path): path is string => !!path);

    if (filePaths.length > 0) {
        try {
            await client.storage.from(BUCKET_NAME).remove(filePaths);
        } catch (e) {
            console.error("Storage deletion failed:", e);
        }
    }
}

/**
 * 强化的图片提取：支持 Markdown ![alt](url) 和 HTML <img src="url">
 */
export function extractImageUrls(content: string): string[] {
    const urls: string[] = [];
    if (!content) return urls;
    
    // 正则说明：1. Markdown 模式 2. HTML <img> 模式 
    const regex = /!\[.*?\]\((.*?)\)|<img\s+[^>]*src=["'](.*?)["']/g;
    
    let match;
    while ((match = regex.exec(content)) !== null) {
        const url = match[1] || match[2];
        if (url) urls.push(url);
    }
    return Array.from(new Set(urls)); // 去重
}
