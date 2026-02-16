"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createMoment(formData: FormData) {
  const content = formData.get("content") as string;
  const files = formData.getAll("images") as File[];

  if (!content && files.length === 0) return;

  const imageUrls: string[] = [];

  // 1. 处理图片上传
  for (const file of files) {
    if (file.size > 0) {
      // 生成唯一文件名，防止重名覆盖
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from("public-images") // 还记得第一阶段建的桶吗？
        .upload(filePath, file);

      if (error) {
        console.error("上传图片失败:", error);
        continue;
      }

      // 获取图片的公开访问链接
      const { data: { publicUrl } } = supabase.storage
        .from("public-images")
        .getPublicUrl(filePath);

      imageUrls.push(publicUrl);
    }
  }

  // 2. 将动态数据写入数据库
  const { error } = await supabase
    .from("moments")
    .insert([
      {
        content,
        images: imageUrls,
      },
    ]);

  if (error) {
    throw new Error("发布失败：" + error.message);
  }

  // 3. 告诉 Next.js 首页数据已过时，需要刷新
  revalidatePath("/");
}

export async function createPost(formData: FormData) {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const excerpt = formData.get("excerpt") as string;

    // 简单的校验
    if (!title || !slug || !content) {
        throw new Error("标题、Slug 和内容必填");
    }

    const { error } = await supabase.from("posts").insert([
        {
        title,
        slug, // 注意：Slug 必须是唯一的，且不能包含空格（建议用连字符）
        content,
        excerpt,
        is_published: true, // 默认直接发布
        },
    ]);

    if (error) {
        // 如果 slug 重复，PostgreSQL 会报错
        throw new Error("发布失败 (可能是 Slug 重复): " + error.message);
    }

    revalidatePath("/blog");
}