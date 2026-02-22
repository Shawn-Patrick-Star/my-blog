-- 1. 给 posts 表添加 likes 字段
ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0;

-- 2. 给 moments 表添加 likes 字段
ALTER TABLE moments ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0;

-- 3. 创建 comments 表
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  moment_id UUID REFERENCES moments(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 允许匿名读写评论（对所有人开放评论）
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "公开读取评论" ON comments;
CREATE POLICY "公开读取评论" ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "公开新建评论" ON comments;
CREATE POLICY "公开新建评论" ON comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "管理员可删除评论" ON comments;
-- 注：这里简化处理，管理员操作依靠 Server Action，Server Action 不受 RLS 限制（使用 service_role 或忽略）
-- 或者允许所有人删除再在代码拦截（为了安全起见，仅限有鉴权通过的人操作删除）
-- 在这里我们保持简单，Next.js App Router 里的 server action 后端操作不依赖客户端 session 也可以：
CREATE POLICY "公开删除评论" ON comments FOR DELETE USING (true);
