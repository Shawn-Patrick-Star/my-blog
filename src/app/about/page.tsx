import { Button } from "@/components/ui/button";
import { Github, Globe, Mail } from "lucide-react";

// Bilibili 自定义 SVG 图标
const BilibiliIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.758v6.844c-.054 1.51-.578 2.769-1.574 3.773-.995 1.004-2.249 1.524-3.758 1.56H5.35c-1.51-.054-2.769-.578-3.773-1.574-1.004-.995-1.524-2.249-1.56-3.758V9.985c.054-1.51.578-2.769 1.574-3.773.995-1.004 2.249-1.524 3.758-1.56h.854l-2.04-2.315a.834.834 0 0 1 .12-1.178.824.824 0 0 1 1.173.125l2.493 2.829h8.216l2.497-2.83a.823.823 0 0 1 1.173-.124.836.836 0 0 1 .12 1.177l-2.055 2.316Zm-2.836 8.718a1.697 1.697 0 0 0-.255-2.261 1.701 1.701 0 0 0-2.263.251 1.706 1.706 0 0 0 .252 2.266 1.698 1.698 0 0 0 2.266-.256ZM9.56 13.37a1.697 1.697 0 0 0-.255-2.261 1.7 1.7 0 0 0-2.263.251 1.706 1.706 0 0 0 .252 2.266 1.698 1.698 0 0 0 2.266-.256Z" />
  </svg>
);

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="bg-[#fffef9] p-8 md:p-10 rounded-2xl border border-amber-100/50 shadow-sm">
        {/* 头部 */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4 border-2 border-amber-200">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-3xl font-bold text-zinc-800">关于我</h1>
          <p className="text-zinc-500 mt-2">一个热爱学习的开发者</p>
        </div>

        {/* 个人介绍 */}
        <div className="prose prose-zinc prose-amber max-w-none mb-10">
          <p className="text-zinc-600 leading-relaxed">
            你好！欢迎来到我的个人空间。這里记录了我在学习编程过程中的思考、笔记和生活碎片。
          </p>
          <p className="text-zinc-600 leading-relaxed">
            我相信学习是一个持续积累的过程，每一个小小的记录都有它的价值。
            希望这里的内容也能对你有所帮助。
          </p>
        </div>

        {/* 技能标签 */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-amber-400 rounded-full" />
            技术栈
          </h2>
          <div className="flex flex-wrap gap-2">
            {["Next.js", "React", "TypeScript", "TailwindCSS", "Supabase", "Python", "Git"].map(
              (skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded-full border border-amber-100 font-medium"
                >
                  {skill}
                </span>
              )
            )}
          </div>
        </div>

        {/* 社交链接 */}
        <div className="border-t border-amber-100 pt-8">
          <h2 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-400 rounded-full" />
            关注我
          </h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/Shawn-Patrick-Star"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                variant="outline"
                className="gap-2 border-zinc-200 hover:bg-zinc-100 hover:text-black"
              >
                <Github size={18} /> GitHub
              </Button>
            </a>

            <a
              href="https://www.zhihu.com/people/john-15-38-91"
              target="_blank"
              rel="noreferrer"
            >
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none">
                <Globe size={18} /> 知乎
              </Button>
            </a>

            <a
              href="https://space.bilibili.com/440335758?spm_id_from=333.1007.0.0"
              target="_blank"
              rel="noreferrer"
            >
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