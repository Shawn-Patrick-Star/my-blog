"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateMoment } from "@/lib/actions/moment";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ImageIcon, X } from "lucide-react";
import imageCompression from "browser-image-compression";

interface EditMomentFormProps {
  moment: {
    id: string;
    content: string;
    images?: string[];
  };
}

export function EditMomentForm({ moment }: EditMomentFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [content, setContent] = useState(moment.content || "");
  const [existingImages, setExistingImages] = useState<string[]>(
    moment.images || []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [progress, setProgress] = useState("");

  useEffect(() => {
    const urls = newFiles.map((file) => URL.createObjectURL(file));
    setNewPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [newFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const incoming = Array.from(files);
    if (existingImages.length + newFiles.length + incoming.length > 9) {
      alert("动态图片总计不能超过 9 张");
      e.target.value = "";
      return;
    }

    setNewFiles((prev) => [...prev, ...incoming]);
    e.target.value = "";
  };

  const removeExisting = (url: string) => {
    setExistingImages((prev) => prev.filter((item) => item !== url));
  };

  const removeNew = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleUpdate() {
    setIsPending(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < newFiles.length; i++) {
        setProgress(`正在上传新图片 ${i + 1}/${newFiles.length}...`);
        const file = newFiles[i];
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
        });
        const fileName = `moment-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const { error } = await supabase.storage
          .from("public-images")
          .upload(fileName, compressed);
        if (error) throw error;

        const { data } = supabase.storage
          .from("public-images")
          .getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }

      const formData = new FormData();
      formData.append("id", moment.id);
      formData.append("content", content);
      formData.append("existing_images", existingImages.join(","));
      formData.append("new_image_urls", uploadedUrls.join(","));

      const result = await updateMoment(formData);

      if (result.success) {
        router.push("/");
        router.refresh();
      }
    } catch (e: any) {
      console.error(e);
      alert("更新失败: " + e.message);
    } finally {
      setIsPending(false);
      setProgress("");
    }
  }

  return (
    <div className="space-y-6">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-30 bg-[#fffef9] border-amber-100 focus-visible:ring-amber-200"
      />

      <div className="space-y-4">
        <label className="text-sm font-medium text-zinc-500">
          图片管理 ({existingImages.length + newFiles.length}/9)
        </label>

        <div className="grid grid-cols-3 gap-2">
          {/* 已有的云端图片 */}
          {existingImages.map((url) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden border border-amber-100"
            >
              <img
                src={url}
                className="object-cover w-full h-full opacity-80"
                alt="existing"
              />
              <button
                onClick={() => removeExisting(url)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-1 left-1 bg-black/40 text-[8px] text-white px-1 rounded">
                已上传
              </div>
            </div>
          ))}

          {/* 待上传的新图片 */}
          {newPreviews.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden border border-blue-200"
            >
              <img
                src={url}
                className="object-cover w-full h-full"
                alt="new"
              />
              <button
                onClick={() => removeNew(index)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-1 left-1 bg-blue-500 text-[8px] text-white px-1 rounded">
                新选择
              </div>
            </div>
          ))}

          {/* 上传按钮 */}
          {existingImages.length + newFiles.length < 9 && (
            <label className="border-2 border-dashed border-amber-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-amber-50/50 aspect-square transition-colors">
              <ImageIcon className="text-amber-300" />
              <span className="text-[10px] text-zinc-400 mt-1">添加</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
      </div>

      {progress && (
        <p className="text-center text-xs text-amber-500 animate-pulse">
          {progress}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleUpdate}
          disabled={isPending}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-100"
        >
          {isPending ? (
            <Loader2 className="animate-spin mr-2" size={16} />
          ) : (
            "保存修改"
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
          className="border-amber-100"
        >
          取消
        </Button>
      </div>
    </div>
  );
}