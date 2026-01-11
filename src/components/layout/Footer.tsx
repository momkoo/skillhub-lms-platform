import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-coral-400 to-coral-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-2xl font-bold">SkillHub</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            다양한 분야의 전문가들과 함께 실무에 바로 쓸 수 있는 기술을 배워보세요.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold mb-4">강의</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="#" className="hover:text-white transition-colors">전체 강의</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">프로그래밍</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">데이터 & AI</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">디자인</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">지원</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="#" className="hover:text-white transition-colors">고객센터</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">자주 묻는 질문</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">강사 지원</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">제휴 문의</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">회사</h4>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link href="#" className="hover:text-white transition-colors">회사 소개</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">채용</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">블로그</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">뉴스룸</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-400">
                        © 2026 SkillHub. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-400">
                        <Link href="#" className="hover:text-white transition-colors">이용약관</Link>
                        <Link href="#" className="hover:text-white transition-colors">개인정보처리방침</Link>
                        <Link href="#" className="hover:text-white transition-colors">쿠키 정책</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
