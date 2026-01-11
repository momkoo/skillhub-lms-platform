import Image from 'next/image';

export default function HeroSection() {
    return (
        <section className="relative min-h-screen flex items-center hero-gradient pt-20 overflow-hidden">
            {/* Floating Shapes */}
            <div className="absolute w-96 h-96 bg-coral-200/30 rounded-full blur-[60px] top-20 -left-48 animate-float" />
            <div className="absolute w-80 h-80 bg-sage-200/30 rounded-full blur-[60px] bottom-40 -right-32 animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute w-64 h-64 bg-coral-100/50 rounded-full blur-[60px] top-1/2 left-1/3 animate-float" style={{ animationDelay: '4s' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-coral-100 px-4 py-2 rounded-full mb-6">
                            <span className="w-2 h-2 bg-coral-500 rounded-full animate-pulse" />
                            <span className="text-coral-700 text-sm font-medium">지금 가장 인기있는 학습 플랫폼</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 leading-tight mb-6">
                            나를 성장시키는<br />
                            <span className="gradient-text">새로운 방식</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            다양한 분야의 전문가들과 함께 실무에 바로 쓸 수 있는 기술을 배워보세요. 체계적인 커리큘럼과 함께하는 성장의 여정.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button className="btn-primary bg-coral-500 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 hover:bg-coral-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                무료로 시작하기
                            </button>
                            <button className="bg-white text-slate-700 px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2 border border-slate-200 hover:bg-coral-50 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                강의 둘러보기
                            </button>
                        </div>

                        {/* Social Proof */}
                        <div className="mt-12 flex items-center gap-6 justify-center lg:justify-start">
                            <div className="flex -space-x-3">
                                <Image
                                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                                    alt="User"
                                    width={40}
                                    height={40}
                                    className="rounded-full border-2 border-white"
                                />
                                <Image
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face"
                                    alt="User"
                                    width={40}
                                    height={40}
                                    className="rounded-full border-2 border-white"
                                />
                                <Image
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                                    alt="User"
                                    width={40}
                                    height={40}
                                    className="rounded-full border-2 border-white"
                                />
                                <Image
                                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face"
                                    alt="User"
                                    width={40}
                                    height={40}
                                    className="rounded-full border-2 border-white"
                                />
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-1">
                                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="font-bold text-slate-800">4.9</span>
                                </div>
                                <p className="text-sm text-slate-500">10,000+ 후기</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="relative hidden lg:block">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-coral-200 to-coral-300 rounded-3xl transform rotate-3" />
                            <Image
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=500&fit=crop"
                                alt="Learning together"
                                width={600}
                                height={500}
                                className="relative rounded-3xl shadow-2xl w-full object-cover"
                                style={{ maxHeight: '500px' }}
                            />
                        </div>

                        {/* Floating Stats Card */}
                        <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-xl p-6 card-hover">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-sage-100 rounded-full flex items-center justify-center">
                                    <svg className="w-7 h-7 text-sage-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-800">50,000+</p>
                                    <p className="text-sm text-slate-500">수강생</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Course Card */}
                        <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 card-hover">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-coral-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-coral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">실시간 강의</p>
                                    <p className="text-sm text-slate-500">100+ 과정</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wave Divider */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#FFFBF8" />
                </svg>
            </div>
        </section>
    );
}
