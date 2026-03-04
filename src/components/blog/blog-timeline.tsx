"use client";

import { format } from "date-fns";
import { BlogCard } from "@/components/blog-card";
import type { Post } from "@/lib/types";

interface BlogTimelineProps {
    posts: Post[];
    isAdmin?: boolean;
}

export function BlogTimeline({ posts, isAdmin }: BlogTimelineProps) {
    // 按月份分组
    const groupedPosts: Record<string, Post[]> = {};
    posts.forEach(post => {
        const date = new Date(post.created_at);
        const key = format(date, "yyyy年MM月");
        if (!groupedPosts[key]) groupedPosts[key] = [];
        groupedPosts[key].push(post);
    });

    const entries = Object.entries(groupedPosts);

    return (
        <div className="relative py-6">
            {/* 
              核心垂直时间轴 
              宽度 2px，左偏置 15px => 中心点刚好在 X = 16px 
              使用渐变色让上下两端柔和淡出，不再需要生硬的起止圆点
            */}
            <div
                className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-transparent via-primary/20 to-transparent"
                aria-hidden="true"
            />

            <div className="space-y-14 relative z-10">
                {entries.map(([month, monthPosts]) => (
                    <section key={month} className="relative">
                        
                        {/* 
                          月份节点指示器 
                          容器 20x20，左偏置 6px => 中心点严格在 X = 16px
                          高度调整为 top-[6px] 刚好与后面 text-2xl 标题垂直居中对齐
                        */}
                        <div className="absolute left-[6px] top-[6px] w-[20px] h-[20px] flex items-center justify-center">
                            {/* 柔和的呼吸光晕背景 */}
                            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
                            {/* 核心节点 */}
                            <div className="w-[10px] h-[10px] rounded-full bg-background border-[2.5px] border-primary shadow-sm" />
                        </div>

                        {/* 月份标题与统计，采用基线对齐 */}
                        <h2 className="text-2xl font-bold text-foreground mb-8 pl-12 flex items-baseline gap-3 tracking-tight">
                            {month}
                            <span className="text-sm font-medium text-muted-foreground/60">
                                {monthPosts.length} 篇
                            </span>
                        </h2>

                        {/* 该月下的文章列表 */}
                        <div className="pl-12 space-y-10">
                            {monthPosts.map((post) => (
                                /* 添加 group 使得悬浮卡片时，对应的连线和小圆点产生联动动画 */
                                <div key={post.id} className="relative group">
                                    
                                    {/* 
                                      悬浮时的交互连线 
                                      父容器 pl-12(48px)，线 left 偏移 -32px => 起点刚好在 X=16px (严丝合缝连接主轴)
                                      宽度 24px => 终点在 X=40px (距离卡片留出 8px 精致空白)
                                      高度 h-2px, top-28px => 中心点 Y=29px
                                    */}
                                    <div className="absolute -left-[32px] top-[28px] w-[24px] h-[2px] bg-primary/10 rounded-full transition-all duration-300 group-hover:bg-primary/40 group-hover:w-[28px]" />

                                    {/* 
                                      轴上的小圆点
                                      大小 8x8，左偏移 -36px => 中心点在 48 - 36 + 4 = 16px (严格在主轴上)
                                      高度 top-25px => 中心点 25 + 4 = 29px (严格在横线上)
                                    */}
                                    <div className="absolute -left-[36px] top-[25px] w-2 h-2 rounded-full bg-background border-[2px] border-primary/30 transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:scale-125 group-hover:shadow-[0_0_10px_rgba(var(--primary),0.3)]" />

                                    {/* 博客卡片组件 */}
                                    <BlogCard post={post} isAdmin={isAdmin} />
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}