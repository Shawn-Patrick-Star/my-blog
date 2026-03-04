import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // 避免 hydration 不匹配
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground rounded-full"
                disabled
            >
                <div className="h-5 w-5" /> {/* 占位 */}
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
                "relative rounded-full",
                "hover:bg-transparent",  // 防止背景干扰
                "text-foreground hover:text-primary"  // 使用主题色
            )}
            title={theme === "dark" ? "切换到日间模式" : "切换到夜间模式"}
        >
            {/* 太阳图标 */}
            <Sun
                className={cn(
                    "h-5 w-5 transition-all",
                    theme === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100"
                )}
            />

            {/* 月亮图标 */}
            <Moon
                className={cn(
                    "absolute h-5 w-5 transition-all",
                    theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
                )}
            />

            <span className="sr-only">
                {theme === "dark" ? "切换到日间模式" : "切换到夜间模式"}
            </span>
        </Button>
    );
}