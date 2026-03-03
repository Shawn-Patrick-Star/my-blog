"use client";

import { format } from "date-fns";
import { BlogCard } from "@/components/blog-card";
import type { Post } from "@/lib/types";

interface BlogTimelineProps {
    posts: Post[];
    isAdmin?: boolean;
}

export function BlogTimeline({ posts, isAdmin }: BlogTimelineProps) {
    // Group posts by year and month
    const groupedPosts: Record<string, Post[]> = {};

    posts.forEach(post => {
        const date = new Date(post.created_at);
        const key = format(date, "yyyy年MM月");
        if (!groupedPosts[key]) groupedPosts[key] = [];
        groupedPosts[key].push(post);
    });

    return (
        <div className="relative pl-6 md:pl-10 border-l-4 border-primary/10 space-y-16 pb-12 ml-4">
            {Object.entries(groupedPosts).map(([month, monthPosts]) => (
                <section key={month} className="relative">
                    {/* Month Marker - Ring style */}
                    <div className="absolute -left-[30px] md:-left-[46px] top-1.5 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-background border-[3px] border-primary z-10 shadow-sm" />
                    </div>

                    <h2 className="text-2xl font-black text-foreground mb-8 flex items-center gap-3">
                        <span className="tracking-tight">
                            {month}
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 gap-10">
                        {monthPosts.map((post) => (
                            <div key={post.id} className="relative">
                                {/* Visual Connector Line */}
                                <div className="absolute -left-[24px] md:-left-[40px] top-12 w-6 md:w-10 h-[2px] bg-primary/10" />
                                <BlogCard post={post} isAdmin={isAdmin} />
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
