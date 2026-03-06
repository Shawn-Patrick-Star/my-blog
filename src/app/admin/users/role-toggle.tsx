"use client";

import { useTransition } from "react";
import { updateUserRoleAction } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, User, Loader2 } from "lucide-react";

export function RoleToggle({ userId, currentRole }: { userId: string, currentRole: string }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        console.log("RoleToggle clicked for user:", userId, "currentRole:", currentRole);
        const nextRole = currentRole === "admin" ? "user" : "admin";
        const msg = nextRole === "admin" ? "确定要将该用户设为管理员吗？" : "确定要取消该用户的管理员权限吗？";

        if (window.confirm(msg)) {
            startTransition(async () => {
                try {
                    console.log("Starting transition to update role to:", nextRole);
                    const result = await updateUserRoleAction(userId, nextRole);
                    console.log("Update result:", result);

                    if (!result.success) {
                        alert(`操作失败: ${result.error}`);
                    }
                } catch (err: any) {
                    console.error("Update role error:", err);
                    alert(`发生意外错误: ${err.message || '未知错误'}`);
                }
            });
        }
    };

    return (
        <Button
            type="button"
            size="sm"
            variant={currentRole === "admin" ? "outline" : "secondary"}
            onClick={handleToggle}
            disabled={isPending}
            className={`rounded-xl font-bold gap-2 min-w-[100px] transition-all ${currentRole === 'admin'
                    ? 'border-blue-500/30 text-blue-500 hover:bg-blue-500/10'
                    : 'hover:bg-primary hover:text-white'
                }`}
        >
            {isPending ? (
                <>
                    <Loader2 size={14} className="animate-spin" /> 处理中
                </>
            ) : currentRole === "admin" ? (
                <>
                    <ShieldAlert size={14} /> 设为花友
                </>
            ) : (
                <>
                    <Shield size={14} /> 设为管理
                </>
            )}
        </Button>
    );
}
