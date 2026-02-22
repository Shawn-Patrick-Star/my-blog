"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { likePost, likeMoment } from "@/lib/actions/interaction";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
    targetId: string;
    targetType: "post" | "moment";
    initialLikes: number;
    className?: string;
    isSmall?: boolean;
}

export function LikeButton({
    targetId,
    targetType,
    initialLikes,
    className,
    isSmall = false,
}: LikeButtonProps) {
    const [likes, setLikes] = useState(initialLikes || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        try {
            const likedItems = JSON.parse(localStorage.getItem("liked_items") || "[]");
            if (likedItems.includes(targetId)) {
                setIsLiked(true);
            }
        } catch (e) {
            console.error("Failed to parse liked_items from localStorage", e);
        }
    }, [targetId]);

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLiked || isLoading) return;

        setIsLoading(true);
        setLikes((prev) => prev + 1);
        setIsLiked(true);

        try {
            const currentLiked = JSON.parse(localStorage.getItem("liked_items") || "[]");
            localStorage.setItem("liked_items", JSON.stringify([...currentLiked, targetId]));
        } catch (e) {
            console.error("Failed to save to localStorage", e);
        }

        try {
            if (targetType === "post") {
                await likePost(targetId);
            } else {
                await likeMoment(targetId);
            }
        } catch (err) {
            // Revert optimistic update
            setLikes((prev) => prev - 1);
            setIsLiked(false);
            try {
                const currentLiked = JSON.parse(localStorage.getItem("liked_items") || "[]");
                localStorage.setItem("liked_items", JSON.stringify(currentLiked.filter((id: string) => id !== targetId)));
            } catch (e) {
                console.error("Failed to update localStorage on err", e);
            }
            console.error("点赞失败", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size={isSmall ? "sm" : "default"}
            onClick={handleLike}
            disabled={isLiked || isLoading}
            className={cn(
                "gap-2 transition-all shadow-sm rounded-full",
                isLiked
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "text-zinc-500 hover:text-red-500 hover:bg-red-50/50 hover:border-red-200 border-zinc-200",
                isSmall ? "px-3 py-1 h-8 text-xs" : "",
                className
            )}
        >
            <Heart
                size={isSmall ? 14 : 18}
                className={cn(isLiked ? "fill-current" : "")}
            />
            <span>{likes > 0 ? likes : "赞"}</span>
        </Button>
    );
}
