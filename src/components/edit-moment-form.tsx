"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateMoment } from "@/lib/actions";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ImageIcon, X, Cloud } from "lucide-react";
import imageCompression from "browser-image-compression";

export function EditMomentForm({ moment }: { moment: any }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [content, setContent] = useState(moment.content || "");
  
  // 分别管理：已有的图片URL、新选的文件、新文件的预览
  const [existingImages, setExistingImages] = useState<string[]>(moment.images || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [progress, setProgress] = useState("");

  // 处理新选文件的预览
  useEffect(() => {
    const urls = newFiles.map(file => URL.createObjectURL(file));
    setNewPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [newFiles]);

  // 处理文件选择 (修复了你提到的覆盖和取消清空问题)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return; // 点击取消不执行

    const incoming = Array.from(files);
    // 限制总数 (已有 + 新选) 不超过 9
    if (existingImages.length + newFiles.length + incoming.length > 9) {
      alert("动态图片总计不能超过 9 张");
      e.target.value = "";
      return;
    }

    setNewFiles(prev => [...prev, ...incoming]); // 追加模式
    e.target.value = ""; // 重置 input 状态
  };

  const removeExisting = (url: string) => {
    setExistingImages(prev => prev.filter(item => item !== url));
  };

  const removeNew = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  async function handleUpdate() {
    setIsPending(true);
    const uploadedUrls: string[] = [];

    try {
      // 1. 上传新选的图片
      for (let i = 0; i < newFiles.length; i++) {
        setProgress(`正在上传新图片 ${i + 1}/${newFiles.length}...`);
        const file = newFiles[i];
        const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1200 });
        const fileName = `moment-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        
        const { error } = await supabase.storage.from("public-images").upload(fileName, compressed);
        if (error) throw error;

        const { data } = supabase.storage.from("public-images").getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }

      // 2. 提交数据 (已有保留的 + 新上传的)
      const formData = new FormData();
      formData.append("id", moment.id);
      formData.append("content", content);
      formData.append("existing_images", existingImages.join(","));
      formData.append("new_image_urls", uploadedUrls.join(","));

      // 调用后端
      const result = await updateMoment(formData);

      // 🔴 关键：后端执行完了，没有报错，我们在这里手动跳转
      if (result.success) {
        // 不需要 alert("成功")，直接回家
        router.push("/");
        router.refresh(); // 确保首页看到最新数据
      }
      
    } catch (e: any) {
      // 这里的 catch 现在只会捕捉真正的“数据库错误”或“网络错误”
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
        className="min-h-30 bg-white border-zinc-200"
      />

      <div className="space-y-4">
        <label className="text-sm font-medium text-zinc-500">图片管理 ({existingImages.length + newFiles.length}/9)</label>
        
        <div className="grid grid-cols-3 gap-2">
          {/* 渲染已有的云端图片 */}
          {existingImages.map((url) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-amber-100">
              <img src={url} className="object-cover w-full h-full opacity-80" alt="existing" />
              <button onClick={() => removeExisting(url)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={12} /></button>
              <div className="absolute bottom-1 left-1 bg-black/40 text-[8px] text-white px-1 rounded">已上传</div>
            </div>
          ))}

          {/* 渲染待上传的新图片 */}
          {newPreviews.map((url, index) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-blue-200">
              <img src={url} className="object-cover w-full h-full" alt="new" />
              <button onClick={() => removeNew(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={12} /></button>
              <div className="absolute bottom-1 left-1 bg-blue-500 text-[8px] text-white px-1 rounded">新选择</div>
            </div>
          ))}

          {/* 上传按钮 (如果总数小于9) */}
          {existingImages.length + newFiles.length < 9 && (
            <label className="border-2 border-dashed border-zinc-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-50 aspect-square">
              <ImageIcon className="text-zinc-300" />
              <span className="text-[10px] text-zinc-400 mt-1">添加</span>
              <input type="file" multiple className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>
      </div>

      {progress && <p className="text-center text-xs text-zinc-400 animate-pulse">{progress}</p>}

      <div className="flex gap-3">
        <Button onClick={handleUpdate} disabled={isPending} className="flex-1 bg-blue-600">
          {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : "保存修改"}
        </Button>
        <Button variant="outline" onClick={() => router.back()} disabled={isPending}>取消</Button>
      </div>
    </div>
  );
}