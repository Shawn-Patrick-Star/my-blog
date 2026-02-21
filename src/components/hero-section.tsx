"use client";

import Image from "next/image";
import Link from "next/link";
import { Camera } from "lucide-react";

// 定义组件接收的参数类型
interface HeroSectionProps {
  initialImage: string; // 图片 URL
  title?: string;       // 标题 (可选)
  isAdmin?: boolean; // 1. 接收这个新参数
}

export function HeroSection({ 
  initialImage, 
  title = "Shawn's BLOG", // 默认标题
  isAdmin = false // 默认为 false
}: HeroSectionProps) {
  // 默认兜底图 (以防数据库里没存或者存的是空字符串)
  const displayImage = initialImage || "https://images.unsplash.com/photo-1490750967868-58cb75069faf?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-sm group mb-10 bg-zinc-200">
      
      <Image
        src={displayImage}
        alt="Hero Background"
        fill
        className="object-cover brightness-75 transition-transform duration-700 group-hover:scale-105"
        priority
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
        <h1 
          className="text-5xl md:text-6xl font-bold tracking-wider drop-shadow-lg text-center px-4"
          style={{ fontFamily: '"Fredoka", sans-serif' }} 
        >
          {title}
        </h1>
        <p className="mt-3 text-lg opacity-90 font-light tracking-widest text-amber-50">
          记录 · 思考 · 生活
        </p>
      </div>

      {/* 2. 只有当 isAdmin 为 true 时，才渲染这个 div */}
      {isAdmin && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <Link href="/admin/settings">
            <button className="bg-black/30 hover:bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs flex items-center gap-2 border border-white/20 transition-colors cursor-pointer">
              <Camera size={14} />
              更换封面/标题
            </button>
          </Link>
        </div>
      )}

    </div>
  );
}