// ============================================================
// 数据库实体类型 (与 Supabase 表结构对应)
// ============================================================

/** 文章 */
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  word_count: number;
  cover_image?: string | null;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

/** 动态/瞬间 */
export interface Moment {
  id: string;
  content: string;
  images?: string[];
  created_at: string;
}

/** 站点配置 (key-value 形式) */
export interface SiteConfig {
  key: string;
  value: string;
}

// ============================================================
// Server Action 返回类型
// ============================================================

export interface ActionResult {
  success?: boolean;
  error?: string;
  slug?: string;
}
