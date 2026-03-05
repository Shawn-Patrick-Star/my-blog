/** 个人资料 */
export interface Profile {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  role: 'super_admin' | 'admin' | 'user';
  username_last_changed: string;
  created_at: string;
}

/** 文章 */
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  word_count: number;
  author_id?: string;
  author?: Profile;
  cover_image?: string | null;
  category?: string;
  is_published: boolean;
  likes?: number;
  created_at: string;
  updated_at?: string;
}

/** 动态/瞬间 */
export interface Moment {
  id: string;
  content: string;
  author_id?: string;
  author?: Profile;
  images?: string[];
  likes?: number;
  created_at: string;
}

/** 消息通知 */
export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment';
  from_user_id: string;
  from_profile?: Profile;
  target_id: string;
  is_read: boolean;
  created_at: string;
}

/** 评论 */
export interface Comment {
  id: string;
  post_id?: string;
  moment_id?: string;
  author_id?: string;
  author?: Profile;
  author_name: string;
  content: string;
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
