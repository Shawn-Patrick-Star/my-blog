import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "我的个人空间",
  description: "记录学习与生活",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className={`${inter.className} bg-white text-zinc-900 antialiased`}>
        {/* 导航栏 */}
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              Garden.
            </Link>
            <div className="flex gap-6 text-sm font-medium text-zinc-600">
              <Link href="/" className="hover:text-zinc-900 transition-colors">动态</Link>
              <Link href="/blog" className="hover:text-zinc-900 transition-colors">笔记</Link>
              <Link href="/admin" className="hover:text-zinc-900 transition-colors">后台</Link>
            </div>
          </div>
        </nav>

        {/* 页面内容 */}
        <main>{children}</main>

        {/* 页脚 */}
        <footer className="py-10 text-center text-xs text-zinc-400 border-t border-zinc-50 mt-20">
          © {new Date().getFullYear()} By YourName. Built with Next.js & Supabase.
        </footer>
      </body>
    </html>
  );
}