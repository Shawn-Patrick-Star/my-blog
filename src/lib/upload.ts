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
 * 从 URL 中提取文件名并从存储中删除
 * @param url 图片的公开 URL
 * @param supabaseClient 可选，传递已认证的 supabase 客户端（如在 Server Actions 中使用）
 */
export async function deleteImageFromUrl(
    url: string | null | undefined,
    supabaseClient?: any
) {
    if (!url) return;
    try {
        const client = supabaseClient || supabase;
        // Supabase URL 格式: .../storage/v1/object/public/public-images/FILENAME
        const parts = url.split("/");
        const fileName = parts[parts.length - 1];

        if (fileName && fileName.includes("?")) {
            // 处理带有查询参数的 URL
            const cleanFileName = fileName.split("?")[0];
            await client.storage.from(BUCKET_NAME).remove([cleanFileName]);
        } else if (fileName) {
            await client.storage.from(BUCKET_NAME).remove([fileName]);
        }
    } catch (e) {
        console.error("Failed to delete image from storage:", e);
    }
}

/**
 * 从 Markdown 文本中提取所有图片 URL
 */
export function extractImageUrls(markdown: string): string[] {
    const urls: string[] = [];
    const regex = /!\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = regex.exec(markdown)) !== null) {
        if (match[1]) urls.push(match[1]);
    }
    return urls;
}
