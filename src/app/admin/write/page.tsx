import { PostEditor } from "@/components/post-editor";
import { createPost, getCategories } from "@/lib/actions/post";
import { ScrollToTop } from "@/components/scroll-to-top";

export default async function NewPostPage() {
  const categories = await getCategories();
  
  return (
    <>
      <PostEditor 
        action={createPost} 
        categories={categories} 
        title="新建笔记" 
      />
      {/* 添加返回顶部按钮，编辑器内容可能很长 */}
      <ScrollToTop />
    </>
  );
}