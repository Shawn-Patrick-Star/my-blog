export function Footer() {
    return (
        <footer className="py-10 text-center text-xs text-zinc-400 border-t border-amber-50 mt-20">
            <p>© {new Date().getFullYear()} Garden. Built with Next.js & Supabase.</p>
            <p className="mt-1 text-zinc-300">用心记录每一个瞬间 ✨</p>
        </footer>
    );
}
