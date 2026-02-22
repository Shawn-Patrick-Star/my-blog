"use server";

import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createMoment(formData: FormData) {
  const content = formData.get("content") as string;
  // 获取前端传来的图片 URL 字符串（用逗号分隔）
  const imageUrlsString = formData.get("image_urls") as string;
  
  const imageUrls = imageUrlsString ? imageUrlsString.split(",") : [];

  if (!content && imageUrls.length === 0) return;

  const { error } = await supabase
    .from("moments")
    .insert([
      {
        content,
        images: imageUrls, // 存入 URL 数组
      },
    ]);

  if (error) {
    throw new Error("发布失败：" + error.message);
  }

  revalidatePath("/");
}

export async function updateMoment(formData: FormData) {
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

export async function deleteMoment(id: string) {
  const { error } = await supabase.from("moments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const tagsStr = formData.get("tags") as string; // 获取标签字符串
  const coverFile = formData.get("cover") as File; // 获取封面图文件

  let slug = formData.get("slug") as string;
  if (!slug) {
    slug = `note-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  }

  let coverImageUrl = null;

  if (coverFile && coverFile.size > 0) {
    const fileName = `cover-${Date.now()}-${coverFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
    const { error: uploadError } = await supabase.storage
      .from("public-images")
      .upload(fileName, coverFile);
    
    if (!uploadError) {
      const { data } = supabase.storage.from("public-images").getPublicUrl(fileName);
      coverImageUrl = data.publicUrl;
    }
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
      word_count: wordCount,
      cover_image: coverImageUrl,
      is_published: true,
    },
  ]);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/blog");
  return { success: true, slug: slug }; // 🔴 返回 slug 用于跳转
}



// 更新文章 (用于编辑功能)
export async function updatePost(formData: FormData) {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const excerpt = formData.get("excerpt") as string;
  const tagsStr = formData.get("tags") as string;
  const coverFile = formData.get("cover") as File; // 获取可能存在的图片文件
  const slug = formData.get("slug") as string; // 确保获取了 slug 用于前端跳转

  let coverImageUrl = undefined; // 初始设为 undefined，表示如果不上传新图就不更新这个字段

  // 如果上传了新封面图
  if (coverFile && coverFile.size > 0) {
    const fileName = `cover-${Date.now()}-${coverFile.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
    const { error: uploadError } = await supabase.storage
      .from("public-images")
      .upload(fileName, coverFile);
    
    if (!uploadError) {
      const { data } = supabase.storage.from("public-images").getPublicUrl(fileName);
      coverImageUrl = data.publicUrl;
    }
  }

  const tags = tagsStr ? tagsStr.split(",").filter(Boolean) : [];
  const wordCount = content.length;

  const updateData: any = {
    title,
    content,
    excerpt,
    tags,
    word_count: wordCount,
    updated_at: new Date().toISOString(),
  };

  // 如果有新图片，才加入更新对象
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
  return { success: true, slug: slug }; // 🔴 返回 slug 用于跳转
}


export async function updateSiteConfig(formData: FormData) {
  // 1. 尝试获取 URL 字符串 (来自方案二：客户端直传)
  const heroImageUrl = formData.get("hero_image_url") as string;
  // 2. 尝试获取文件对象 (兼容方案一：服务端上传，如果以后要用)
  const heroImageFile = formData.get("hero_image") as File;
  
  const siteTitle = formData.get("site_title") as string;

  // 逻辑分支 A：如果是客户端传来的 URL，直接存库（这是最快的）
  if (heroImageUrl) {
    await supabase
      .from("site_config")
      .upsert({ key: "hero_image", value: heroImageUrl }, { onConflict: "key" });
  } 
  // 逻辑分支 B：如果是文件，说明走了服务端中转（备用逻辑）
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

  // 处理标题
  if (siteTitle) {
    await supabase
      .from("site_config")
      .upsert({ key: "site_title", value: siteTitle }, { onConflict: "key" });
  }

  revalidatePath("/");
}

// 1. 删除文章
export async function deletePost(id: string) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/"); // 刷新首页
  revalidatePath("/blog"); // 刷新列表页
}