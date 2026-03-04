"use client";

import Link from "next/link";
import { Camera } from "lucide-react";
import { HeroSlider } from "./hero-slider";

// 定义组件接收的参数类型
interface HeroSectionProps {
  images?: string[];    // 图片 URL 数组
  initialImage?: string; // 旧的单图兼容
  title?: string;       // 标题 (可选)
  isAdmin?: boolean;
}

export function HeroSection({
  images = [],
  initialImage,
  title = "Shawn's BLOG",
  isAdmin = false
}: HeroSectionProps) {
  // 优选 images 数组，如果没有则用单图转为数组
  const displayImages = images.length > 0
    ? images
    : initialImage ? [initialImage] : [];

  return (
    <div className="relative w-full h-64 md:h-[400px] rounded-3xl overflow-hidden shadow-2xl group mb-10 bg-zinc-100">

      <HeroSlider images={displayImages} />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 pointer-events-none">
        <h1
          className="font-fredoka text-5xl md:text-7xl font-bold tracking-tight drop-shadow-2xl text-center px-4 animate-in fade-in zoom-in duration-1000"
        >
          {title}
        </h1>
        <p className="mt-4 text-xl opacity-80 font-medium tracking-widest text-white/90 drop-shadow-md">
          记录 · 思考 · 生活
        </p>
      </div>

      {isAdmin && (
        <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 translate-y-2 group-hover:translate-y-0">
          <Link href="/admin/settings">
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 border border-white/20 transition-all shadow-xl">
              <Camera size={16} />
              个性化配置
            </button>
          </Link>
        </div>
      )}

    </div>
  );
}
