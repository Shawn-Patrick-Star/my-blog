import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/post-editor";
import { updatePost, getCategories } from "@/lib/actions/post";
import { ScrollToTop } from "@/components/scroll-to-top";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();
  if (!post) notFound();

  const categories = await getCategories();

  return (
    <>
      <PostEditor initialData={post} categories={categories} action={updatePost} title="编辑笔记" />
      <ScrollToTop />
    </>
  );
}