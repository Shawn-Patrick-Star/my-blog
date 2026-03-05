"use client";

import { useTransition } from "react";
import { updateUserRoleAction } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import { Shield, ShieldAlert, User, Loader2 } from "lucide-react";

export function RoleToggle({ userId, currentRole }: { userId: string, currentRole: string }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        const nextRole = currentRole === "admin" ? "user" : "admin";
        const msg = nextRole === "admin" ? "确定要设为管理员吗？" : "确定要取消管理员权限吗？";

        if (confirm(msg)) {
            startTransition(async () => {
                const { success, error } = await updateUserRoleAction(userId, nextRole);
                if (!success) {
                    alert(error);
                }
            });
        }
    };

    return (
        <Button
            size="sm"
            variant={currentRole === "admin" ? "outline" : "secondary"}
            onClick={handleToggle}
            disabled={isPending}
            className={`rounded-xl font-bold gap-2 ${currentRole === 'admin' ? 'border-blue-500/30 text-blue-500 hover:bg-blue-500/10' : ''}`}
        >
            {isPending ? (
                <Loader2 size={14} className="animate-spin" />
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
