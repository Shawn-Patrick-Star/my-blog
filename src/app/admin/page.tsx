import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, PenTool, Camera, LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 transition-colors duration-300">
      {/* 顶部标题栏 + 退出按钮 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">控制台</h1>
          <p className="text-muted-foreground mt-1">
            欢迎回来，这里是你的数字花园指挥中心。
          </p>
        </div>
        <form action={logoutAction}>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/10 rounded-full"
          >
            <LogOut size={14} />
            退出登录
          </Button>
        </form>
      </div>

      {/* 功能卡片网格 */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/admin/write">
          <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full border-border bg-card">
            <CardHeader>
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <PenTool size={20} />
              </div>
              <CardTitle className="text-foreground">写新文章</CardTitle>
              <CardDescription className="text-muted-foreground">
                Markdown 编辑器，支持代码高亮，用于深度思考。
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/moments">
          <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full border-border bg-card">
            <CardHeader>
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <Camera size={20} />
              </div>
              <CardTitle className="text-foreground">发生活瞬间</CardTitle>
              <CardDescription className="text-muted-foreground">
                类似朋友圈，支持多图上传，记录生活碎片。
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/settings">
          <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer h-full border-border bg-card">
            <CardHeader>
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <Settings size={20} />
              </div>
              <CardTitle className="text-foreground">网站设置</CardTitle>
              <CardDescription className="text-muted-foreground">
                装修你的门面，更换首页背景图和标题。
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}