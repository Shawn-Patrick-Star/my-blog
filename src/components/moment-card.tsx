import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns"; // 我们需要安装这个库来处理时间格式

interface MomentCardProps {
  content: string;
  createdAt: string;
  images?: string[];
}

export function MomentCard({ content, createdAt, images }: MomentCardProps) {
  return (
    <Card className="w-full max-w-md border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-3 p-4">
        <div className="h-10 w-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-500">
          Me
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">我的动态</span>
          <span className="text-xs text-zinc-500">
            {format(new Date(createdAt), "yyyy-MM-dd HH:mm")}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <p className="text-sm leading-relaxed text-zinc-800 whitespace-pre-wrap">
          {content}
        </p>
        
        {/* 图片展示区域 - 暂时简单处理，后面再做九宫格 */}
        {images && images.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {images.map((url, index) => (
              <img 
                key={index} 
                src={url} 
                alt="moment" 
                className="rounded-lg object-cover w-full h-32"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}