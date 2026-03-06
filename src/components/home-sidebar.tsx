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
                img: "/illustrations/sleep.png",
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
            {/* 统一的状态统计卡片 */}
            <Card className={`border-border rounded-[2.5rem] overflow-hidden bg-linear-to-br ${status.color} backdrop-blur-md shadow-xl transition-all duration-500`}>
                <CardContent className="p-0">
                    {/* 正方形插图区 */}
                    <div className="h-48 w-full relative group overflow-hidden bg-muted/20">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img
                                src={status.img}
                                alt={status.text}
                                onError={(e) => {
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

                    <div className="p-4 space-y-4">
                        {/* 实时时间 */}
                        <div className="flex flex-col items-center justify-center space-y-0.5 py-3 bg-background/40 rounded-4xl border border-border/20 shadow-inner">
                            <div className="flex items-center gap-2 text-primary">
                                <Clock size={14} className="animate-pulse" />
                                <span className="text-[10px] font-bold tracking-tighter uppercase opacity-70">Current Time</span>
                            </div>
                            <div className="text-4xl font-black text-foreground tabular-nums tracking-tighter">
                                {format(now, "HH:mm")}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-medium opacity-80">
                                {format(now, "yyyy-MM-dd EEE")}
                            </div>
                        </div>

                        {/* 站点统计 - 合并到主卡片并单行显示 */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col items-center justify-center py-2 px-1 bg-background/30 rounded-2xl border border-border/10">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <Eye size={12} className="text-blue-500" />
                                    <span className="text-[10px] font-bold text-muted-foreground">总访问</span>
                                </div>
                                <span className="text-sm font-black text-foreground tabular-nums tracking-tighter">
                                    {stats.page_views.toLocaleString()}
                                </span>
                            </div>

                            <div className="flex flex-col items-center justify-center py-2 px-1 bg-background/30 rounded-2xl border border-border/10">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <Users size={12} className="text-purple-500" />
                                    <span className="text-[10px] font-bold text-muted-foreground">访客数</span>
                                </div>
                                <span className="text-sm font-black text-foreground tabular-nums tracking-tighter">
                                    {stats.unique_visitors.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
