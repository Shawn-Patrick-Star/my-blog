import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, PenTool, Camera, LogOut, ArrowLeft, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const userWithProfile = await getCurrentUser();
  if (!userWithProfile || !["admin", "super_admin"].includes(userWithProfile.profile.role)) {
    redirect("/login");
  }

  const isSuper = userWithProfile.profile.role === "super_admin";

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 transition-colors duration-300">
      {/* 顶部标题栏 + 退出按钮 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">控制台</h1>
          <p className="text-muted-foreground mt-1 font-medium italic opacity-80">
            欢迎回来，{userWithProfile.profile.username}。这里是你的数字花园指挥中心。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 rounded-full font-bold">
              <ArrowLeft size={14} /> 回首页
            </Button>
          </Link>
          <form action={logoutAction}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/10 rounded-full font-bold"
            >
              <LogOut size={14} />
              注销
            </Button>
          </form>
        </div>
      </div>

      {/* 功能卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/write">
          <Card className="hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-full border-border bg-card rounded-[32px] overflow-hidden group">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PenTool size={24} />
              </div>
              <CardTitle className="text-foreground font-black text-xl">写新文章</CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                Markdown 编辑器，支持代码高亮，用于深度思考。
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/moments">
          <Card className="hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-full border-border bg-card rounded-[32px] overflow-hidden group">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera size={24} />
              </div>
              <CardTitle className="text-foreground font-black text-xl">发生活瞬间</CardTitle>
              <CardDescription className="text-muted-foreground font-medium">
                类似朋友圈，支持多图上传，记录生活碎片。
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        {isSuper && (
          <Link href="/admin/settings">
            <Card className="hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-full border-border bg-card rounded-[32px] overflow-hidden group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Settings size={24} />
                </div>
                <CardTitle className="text-foreground font-black text-xl">网站设置</CardTitle>
                <CardDescription className="text-muted-foreground font-medium">
                  装修你的门面，更换首页背景图和标题。
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        )}

        {isSuper && (
          <Link href="/admin/users">
            <Card className="hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer h-full border-border bg-card rounded-[32px] overflow-hidden group">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UserCog size={24} />
                </div>
                <CardTitle className="text-foreground font-black text-xl">权限管理</CardTitle>
                <CardDescription className="text-muted-foreground font-medium">
                  管理站点管理员，控制成员访问权限。
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}
