import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

// 自定义简单的图标组件 (Lucide 可能没有 B站 和 知乎，用文字或 SVG 代替)
const BilibiliIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.758v6.844c-.054 1.51-.578 2.769-1.574 3.773-.995 1.004-2.249 1.524-3.758 1.56H5.35c-1.51-.054-2.769-.578-3.773-1.574-1.004-.995-1.524-2.249-1.56-3.758V9.985c.054-1.51.578-2.769 1.574-3.773.995-1.004 2.249-1.524 3.758-1.56h.854l-2.04-2.315a.834.834 0 0 1 .12-1.178.824.824 0 0 1 1.173.125l2.493 2.829h8.216l2.497-2.83a.823.823 0 0 1 1.173-.124.836.836 0 0 1 .12 1.177l-2.055 2.316Zm-2.836 8.718a1.697 1.697 0 0 0-.255-2.261 1.701 1.701 0 0 0-2.263.251 1.706 1.706 0 0 0 .252 2.266 1.698 1.698 0 0 0 2.266-.256ZM9.56 13.37a1.697 1.697 0 0 0-.255-2.261 1.7 1.7 0 0 0-2.263.251 1.706 1.706 0 0 0 .252 2.266 1.698 1.698 0 0 0 2.266-.256Z" /></svg>
);

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="bg-[#fffef9] p-8 rounded-2xl border border-amber-100/50 shadow-sm">
        <h1 className="text-3xl font-bold mb-8 text-zinc-800">关于我</h1>
        
        {/* ... 原有内容 ... */}
        <div className="prose prose-amber mb-10">
           <p>这里是我的个人介绍...</p>
        </div>

        <div className="border-t border-amber-100 pt-8">
          <h2 className="text-xl font-bold mb-6 text-zinc-800">关注我</h2>
          <div className="flex gap-4">
            <a href="https://github.com/Shawn-Patrick-Star" target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2 hover:bg-zinc-100 hover:text-black">
                <Github size={18} /> GitHub
              </Button>
            </a>
            
            <a href="https://www.zhihu.com/people/john-15-38-91" target="_blank" rel="noreferrer">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none">
                知乎
              </Button>
            </a>

            <a href="https://space.bilibili.com/440335758?spm_id_from=333.1007.0.0" target="_blank" rel="noreferrer">
               <Button className="gap-2 bg-pink-400 hover:bg-pink-500 text-white border-none">
                <BilibiliIcon /> Bilibili
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}