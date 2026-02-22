import { PostEditor } from "@/components/post-editor";
import { createPost } from "@/lib/actions";

export default function NewPostPage() {
  return <PostEditor action={createPost} title="写新笔记" />;
}