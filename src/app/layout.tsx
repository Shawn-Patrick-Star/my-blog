import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { getCurrentUser } from "@/lib/auth";

// Inter 字体配置（用于正文）
const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',  // 添加 CSS 变量
});

// Fredoka 字体配置（用于标题）
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "600", "700"],  // 添加需要的字重
  variable: '--font-fredoka',      // 添加 CSS 变量
});

export const metadata: Metadata = {
  title: {
    default: "Shawn's Garden | 个人技术博客",
    template: "%s | Shawn's Garden"
  },
  description: "记录技术点滴、生活瞬间与深度思考的个人空间。",
  keywords: ["博客", "技术", "前端", "Next.js", "Supabase"],
  authors: [{ name: "Shawn" }],
  openGraph: {
    title: "Shawn's Garden",
    description: "记录技术点滴、生活瞬间与深度思考的个人空间。",
    url: 'https://shawn-garden.vercel.app',
    siteName: "Shawn's Garden",
    locale: 'zh_CN',
    type: 'website',
  },
  icons: {
    icon: '/gardening.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userWithProfile = await getCurrentUser();
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={`${inter.variable} ${fredoka.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar initialUser={userWithProfile} />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}