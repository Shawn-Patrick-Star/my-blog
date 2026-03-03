"use client";

import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PostAdminActionsProps {
  postId: string;
}

export function PostAdminActions({ postId }: PostAdminActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("确定要删除这篇文章吗？此操作不可撤销。")) {
      try {
        const response = await fetch(`/api/posts/${postId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          router.refresh();
          router.push("/blog");
        }
      } catch (error) {
        console.error("删除失败:", error);
        alert("删除失败，请重试");
      }
    }
  };

  return (
    <>
      {/* 编辑按钮 - 纯图标 */}
      <Link href={`/admin/write/${postId}`}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
          title="编辑文章"
        >
          <Edit size={16} />
          <span className="sr-only">编辑</span>
        </Button>
      </Link>

      {/* 删除按钮 - 纯图标 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        title="删除文章"
      >
        <Trash2 size={16} />
        <span className="sr-only">删除</span>
      </Button>
    </>
  );
}