"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import { deletePost } from "@/lib/actions/post";

export function PostAdminActions({ postId }: { postId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("确定要删除这篇笔记吗？删除后不可恢复。")) {
      try {
        await deletePost(postId);
        alert("删除成功");
        router.push("/");
      } catch (err: any) {
        alert("删除失败: " + err.message);
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Link href={`/admin/write/${postId}`}>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium border border-amber-100">
          <Edit size={14} />
          编辑
        </button>
      </Link>
      <button
        onClick={handleDelete}
        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-100"
      >
        <Trash2 size={14} />
        删除
      </button>
    </div>
  );
}