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
  const tagsStr = formData.get("tags") as string; // 获取标签字符串
  const coverFile = formData.get("cover") as File; // 获取封面图文件

  let coverImageUrl = null;

  // 1. 上传封面图 (如果有)
  if (coverFile && coverFile.size > 0) {
    const fileName = `cover-${Date.now()}-${coverFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("public-images")
      .upload(fileName, coverFile);
    
    if (!uploadError) {
      const { data } = supabase.storage.from("public-images").getPublicUrl(fileName);
      coverImageUrl = data.publicUrl;
    }
  }

  // 2. 处理标签 (逗号分隔转数组)
  const tags = tagsStr ? tagsStr.split(/[,，]/).map(t => t.trim()).filter(Boolean) : [];

  // 3. 计算字数 (简单计算)
  const wordCount = content.length;

  const { error } = await supabase.from("posts").insert([
    {
      title,
      slug,
      content,
      excerpt,
      tags,
      word_count: wordCount,
      cover_image: coverImageUrl,
      is_published: true,
    },
  ]);

  if (error) throw new Error(error.message);
  revalidatePath("/blog");
}

export async function updateSiteConfig(formData: FormData) {
  const heroImageFile = formData.get("hero_image") as File;
  const siteTitle = formData.get("site_title") as string;

  // 1. 如果上传了新图片，处理上传
  if (heroImageFile && heroImageFile.size > 0) {
    const fileName = `hero-${Date.now()}-${heroImageFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("public-images")
      .upload(fileName, heroImageFile);
    
    if (uploadError) throw new Error("图片上传失败: " + uploadError.message);

    const { data } = supabase.storage.from("public-images").getPublicUrl(fileName);
    const publicUrl = data.publicUrl;

    // 更新数据库中的 hero_image
    await supabase
      .from("site_config")
      .upsert({ key: "hero_image", value: publicUrl }, { onConflict: "key" });
  }

  // 2. 如果修改了标题 (可选功能，顺手加上)
  if (siteTitle) {
    await supabase
      .from("site_config")
      .upsert({ key: "site_title", value: siteTitle }, { onConflict: "key" });
  }

  // 3. 刷新首页
  revalidatePath("/");
}