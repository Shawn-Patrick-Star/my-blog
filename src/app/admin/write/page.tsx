import { PostEditor } from "@/components/post-editor";
import { createPost, getCategories } from "@/lib/actions/post";

export default async function NewPostPage() {
  const categories = await getCategories();
  return <PostEditor action={createPost} categories={categories} title="写新笔记" />;
}