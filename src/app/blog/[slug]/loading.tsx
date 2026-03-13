import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <div className="absolute inset-0 w-12 h-12 border-4 border-primary/20 rounded-full"></div>
      </div>
      <p className="text-muted-foreground font-medium animate-pulse text-sm tracking-widest uppercase">
        正在准备笔记内容...
      </p>
    </div>
  );
}
