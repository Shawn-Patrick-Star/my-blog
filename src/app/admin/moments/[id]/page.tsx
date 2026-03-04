import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { EditMomentForm } from "@/components/edit-moment-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditMomentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: moment } = await supabase
    .from("moments")
    .select("*")
    .eq("id", id)
    .single();

  if (!moment) notFound();

  return (
    <div className="max-w-md mx-auto py-10 px-4 transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-paper-line transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-paper-text">编辑动态</h1>
      </div>
      <EditMomentForm moment={moment} />
    </div>
  );
}