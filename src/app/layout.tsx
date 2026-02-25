import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme-provider";

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
  title: "我的个人空间",
  description: "记录学习与生活",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={`${inter.variable} ${fredoka.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}