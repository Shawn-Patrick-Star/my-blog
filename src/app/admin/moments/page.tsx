"use client";

import { createMoment } from "@/lib/actions/moment";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Image as ImageIcon, X, ArrowLeft } from "lucide-react";
import imageCompression from "browser-image-compression";
import Link from "next/link";

export default function AdminMoments() {
  const [isPending, setIsPending] = useState(false);
  const [progress, setProgress] = useState("");
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const router = useRouter();

  // 当选择文件变化时，生成预览图
  useEffect(() => {
    if (selectedFiles.length === 0) {
      setPreviews([]);
      return;
    }
    const objectUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(objectUrls);
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    if (selectedFiles.length + newFiles.length > 9) {
      alert("总计不能超过 9 张图片哦！");
      e.target.value = "";
      return;
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleSubmit() {
    if (!content && selectedFiles.length === 0) {
      alert("内容或图片不能为空");
      return;
    }

    setIsPending(true);
    const imageUrls: string[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setProgress(`正在处理第 ${i + 1}/${selectedFiles.length} 张...`);

        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
        });
        const fileExt = file.name.split(".").pop();
        const fileName = `moment-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("public-images")
          .upload(fileName, compressedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("public-images")
          .getPublicUrl(fileName);
        imageUrls.push(urlData.publicUrl);
      }

      const formData = new FormData();
      formData.append("content", content);
      formData.append("image_urls", imageUrls.join(","));

      await createMoment(formData);
      router.push("/community");
      router.refresh();
    } catch (error: any) {
      alert("发布失败: " + error.message);
    } finally {
      setIsPending(false);
      setProgress("");
    }
  }

  return (
    <div className="max-w-md mx-auto py-10 px-4 transition-colors duration-300">
      {/* 顶部导航 */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-paper-line transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-paper-text">发布新动态</h1>
      </div>

      <div className="space-y-4">
        <Textarea
          placeholder="分享新鲜事..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-30 resize-none border-paper-border bg-paper-bg focus-visible:ring-paper-line/30 text-paper-text"
        />

        {/* 图片预览 (九宫格) */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((url, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden border border-paper-border shadow-sm"
              >
                <img
                  src={url}
                  alt="preview"
                  className="object-cover w-full h-full"
                />
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 图片选择器 */}
        <div className="relative border-2 border-dashed border-paper-border rounded-xl bg-paper-bg/50 p-4 hover:border-paper-line/30 transition-colors">
          <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
            <ImageIcon className="w-6 h-6 text-paper-line/60" />
            <span className="text-sm text-paper-text/60">
              {selectedFiles.length > 0
                ? `已选中 ${selectedFiles.length}/9 张`
                : "点击选择图片"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {isPending && (
          <p className="text-xs text-center text-paper-line animate-pulse">
            {progress}
          </p>
        )}

        <Button
          onClick={handleSubmit}
          className="w-full bg-paper-line hover:bg-paper-line/90 text-white dark:text-paper-bg shadow-lg shadow-paper-line/20"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
          ) : (
            "发布动态"
          )}
        </Button>
      </div>
    </div>
  );
}