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
        <div className="relative pl-8 md:pl-12 border-l-2 border-primary/20 space-y-12 pb-10 ml-2 md:ml-4">
            {Object.entries(groupedPosts).map(([month, monthPosts]) => (
                <section key={month} className="relative">
                    {/* Month Marker */}
                    <div className="absolute -left-[41px] md:-left-[57px] top-0 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-background border-4 border-primary z-10" />
                    </div>

                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-sm">
                            {month}
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 gap-6">
                        {monthPosts.map((post) => (
                            <div key={post.id} className="relative">
                                {/* Visual Connector Line */}
                                <div className="absolute -left-[34px] md:-left-[50px] top-10 w-8 md:w-12 h-px bg-primary/20" />
                                <BlogCard post={post} isAdmin={isAdmin} />
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
