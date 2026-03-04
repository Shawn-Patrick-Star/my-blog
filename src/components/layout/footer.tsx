export function Footer() {
    return (
        <footer className="py-10 text-center text-xs text-muted-foreground border-t border-border mt-20 transition-colors">
            <p>© {new Date().getFullYear()} Garden. Built with Next.js & Supabase.</p>
            <p className="mt-1 opacity-60 italic">用心记录每一个瞬间 ✨</p>
        </footer>
    );
}
