import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "600"] });
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
      <body className={`${inter.className} bg-[#fdfbf6] text-zinc-900 antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}