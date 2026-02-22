import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { EditMomentForm } from "@/components/edit-moment-form";

export default async function EditMomentPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  const { data: moment } = await supabase
    .from("moments")
    .select("*")
    .eq("id", id)
    .single();

  if (!moment) notFound();

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-xl font-bold mb-6 text-zinc-800">编辑动态</h1>
      <EditMomentForm moment={moment} />
    </div>
  );
}