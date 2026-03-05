"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Eye, Users, Sun, Moon, Coffee, Briefcase, BookOpen, Utensils, Zap } from "lucide-react";
import { format } from "date-fns";

interface HomeSidebarProps {
    stats: {
        page_views: number;
        unique_visitors: number;
    };
}

export function HomeSidebar({ stats }: HomeSidebarProps) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hour = now.getHours();

    // 根据时间段获取状态信息
    const getStatusInfo = () => {
        if (hour >= 0 && hour < 7) {
            return {
                text: "正在梦游中...",
                icon: <Moon className="text-indigo-400" />,
                img: "/illustrations/sleep.png", // 用户以后可以替换这些路径
                color: "from-indigo-500/10 to-purple-500/10"
            };
        }
        if (hour >= 7 && hour < 9) {
            return {
                text: "吃个早餐，开启新一天",
                icon: <Coffee className="text-orange-400" />,
                img: "/illustrations/breakfast.png",
                color: "from-orange-500/10 to-yellow-500/10"
            };
        }
        if (hour >= 9 && hour < 12) {
            return {
                text: "专注工作中...",
                icon: <Briefcase className="text-blue-400" />,
                img: "/illustrations/work.png",
                color: "from-blue-500/10 to-cyan-500/10"
            };
        }
        if (hour >= 12 && hour < 14) {
            return {
                text: "午休充电时间",
                icon: <Utensils className="text-green-400" />,
                img: "/illustrations/lunch.png",
                color: "from-green-500/10 to-emerald-500/10"
            };
        }
        if (hour >= 14 && hour < 18) {
            return {
                text: "继续奋斗中",
                icon: <Zap className="text-yellow-400" />,
                img: "/illustrations/work.png",
                color: "from-yellow-400/10 to-orange-400/10"
            };
        }
        if (hour >= 18 && hour < 20) {
            return {
                text: "晚饭时间，放松一下",
                icon: <Sun className="text-red-400" />,
                img: "/illustrations/dinner.png",
                color: "from-red-500/10 to-rose-500/10"
            };
        }
        if (hour >= 20 && hour < 22) {
            return {
                text: "阅读与独立思考",
                icon: <BookOpen className="text-purple-400" />,
                img: "/illustrations/read.png",
                color: "from-purple-500/10 to-violet-500/10"
            };
        }
        return {
            text: "深夜灵感爆发期",
            icon: <Moon className="text-slate-400" />,
            img: "/illustrations/night.png",
            color: "from-slate-500/10 to-zinc-500/10"
        };
    };

    const status = getStatusInfo();

    return (
        <div className="space-y-6">
            {/* 实时状态卡片 */}
            <Card className={`border-border rounded-[2.5rem] overflow-hidden bg-linear-to-br ${status.color} backdrop-blur-md shadow-xl transition-all duration-500`}>
                <CardContent className="p-0">
                    {/* 正方形插图区 */}
                    <div className="aspect-square w-full relative group overflow-hidden bg-muted/20">
                        {/* 这里的图片路径用户根据自己的插图修改 */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img
                                src={status.img}
                                alt={status.text}
                                onError={(e) => {
                                    // 如果图片没找到，显示一个优雅的占位图标
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLDivElement;
                                    if (fallback) {
                                        fallback.classList.remove('hidden');
                                        fallback.classList.add('flex');
                                    }
                                }}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="hidden absolute inset-0 items-center justify-center opacity-40 bg-accent">
                                {status.icon}
                            </div>
                        </div>
                        {/* 浮动的状态标签 */}
                        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-border/50 translate-y-0 group-hover:-translate-y-1 transition-transform">
                            {status.icon}
                            <span className="text-xs font-black text-foreground">{status.text}</span>
                        </div>
                    </div>

                    <div className="p-4 space-y-2 -mt-2">
                        {/* 实时时间 */}
                        <div className="flex flex-col items-center justify-center space-y-0.5 py-1.5 bg-background/40 rounded-3xl border border-border/20 shadow-inner">
                            <div className="flex items-center gap-2 text-primary">
                                <Clock size={16} className="animate-pulse" />
                                <span className="text-xs font-bold tracking-tighter uppercase opacity-70">Current Time</span>
                            </div>
                            <div className="text-3xl font-black text-foreground tabular-nums tracking-tight">
                                {format(now, "HH:mm")}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium">
                                {format(now, "yyyy-MM-dd EEE")}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 站点统计卡片 */}
            <Card className="border-border rounded-[2.5rem] bg-card/40 backdrop-blur-md shadow-sm border-dashed">
                <CardContent className="p-6 space-y-5">
                    <h4 className="text-sm font-black text-muted-foreground flex items-center gap-2 px-2">
                        < Zap size={14} className="text-primary" />
                        站点统计
                    </h4>

                    <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-3xl group hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Eye size={18} />
                                </div>
                                <span className="text-sm font-bold text-foreground/70">总访问量</span>
                            </div>
                            <span className="text-lg font-black text-foreground tabular-nums tracking-tighter">
                                {stats.page_views.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-3xl group hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Users size={18} />
                                </div>
                                <span className="text-sm font-bold text-foreground/70">访客人数</span>
                            </div>
                            <span className="text-lg font-black text-foreground tabular-nums tracking-tighter">
                                {stats.unique_visitors.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
