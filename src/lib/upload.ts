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
