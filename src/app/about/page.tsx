export default function AboutPage() {
    return (
        <div className="max-w-2xl mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">关于我</h1>
        
        <div className="prose prose-zinc mb-10">
            <p>
            你好！我是[你的名字]，一名热爱技术的开发者。
            </p>
            <p>
            这个网站是我的“数字花园”，我在这里记录：
            </p>
            <ul>
            <li>学习编程过程中的踩坑记录</li>
            <li>日常生活中的闪光时刻</li>
            <li>对新技术的探索和思考</li>
            </ul>
            <p>
            如果你对我的内容感兴趣，欢迎通过下面的方式联系我。
            </p>
        </div>

        <div className="border-t border-zinc-100 pt-8">
            <h2 className="text-xl font-bold mb-4">联系方式</h2>
            <ul className="space-y-2 text-zinc-600">
            <li>Email: your.email@example.com</li>
            <li>GitHub: <a href="https://github.com/yourname" className="text-blue-600 hover:underline">@yourname</a></li>
            {/* <li>微信: xxx</li> */}
            </ul>
        </div>
        </div>
    );
}