import Link from "next/link";
import { logoutAction } from "@/app/login/action"; // 引入退出动作
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PenTool, Camera, LogOut } from "lucide-react"; // 确保安装了 lucide-react

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold mb-2">控制台</h1>
      <p className="text-zinc-500 mb-8">欢迎回来，这里是你的数字花园指挥中心。</p>
      <form action={logoutAction}>
        <button className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-4 py-2 rounded-md transition-colors">
          <LogOut size={16} />
          退出登录
        </button>
      </form>
      <div className="grid md:grid-cols-2 gap-6">
        {/* 写文章入口 */}
        <Link href="/admin/write">
          <Card className="hover:bg-zinc-50 transition-colors cursor-pointer h-full border-zinc-200">
            <CardHeader>
              <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center mb-4">
                <PenTool size={20} />
              </div>
              <CardTitle>写新文章</CardTitle>
              <CardDescription>
                Markdown 编辑器，支持代码高亮，用于深度思考。
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {/* 发动态入口 */}
        <Link href="/admin/moments">
          <Card className="hover:bg-zinc-50 transition-colors cursor-pointer h-full border-zinc-200">
            <CardHeader>
              <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center mb-4">
                <Camera size={20} />
              </div>
              <CardTitle>发生活瞬间</CardTitle>
              <CardDescription>
                类似朋友圈，支持多图上传，记录生活碎片。
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}