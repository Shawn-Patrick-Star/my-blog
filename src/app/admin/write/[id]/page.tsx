import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { EditPostForm } from "@/components/edit-post-form"; // 引入刚才创建的组件

// 👇 这是一个异步服务端组件，不要加 "use client"
export default async function EditPostPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // 1. 解析参数
  const { id } = await params;

  // 2. 获取数据
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();

  // 3. 将数据传递给客户端组件进行渲染
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">编辑文章</h1>
      <EditPostForm post={post} />
    </div>
  );
}