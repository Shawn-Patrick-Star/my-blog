import type { Config } from "tailwindcss";

const config: Config = {
  // 核心配置：告诉 Tailwind 扫描哪些文件里的类名
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 这里保留了 Shadcn UI 所需的变量扩展
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),      // Shadcn 动画插件
    require("@tailwindcss/typography"),  // 👈 重点：Markdown 渲染所需的排版插件
  ],
};

export default config;