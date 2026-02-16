import { createClient } from '@supabase/supabase-js'

// 从环境变量中读取我们在第一阶段配置的 URL 和 Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 创建并导出 Supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseKey)