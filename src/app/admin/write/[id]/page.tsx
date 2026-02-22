import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/post-editor";
import { updatePost } from "@/lib/actions";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: post } = await supabase.from("posts").select("*").eq("id", id).single();
  if (!post) notFound();

  return <PostEditor initialData={post} action={updatePost} title="编辑笔记" />;
}