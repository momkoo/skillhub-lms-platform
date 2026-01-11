import Image from 'next/image';

const testimonials = [
    {
        content: '"Python을 전혀 몰랐던 제가 지금은 웹 서비스 하나를 직접 만들고 있어요. 강사님이 너무 쉽게 설명해주셔서 금방 따라할 수 있었어요. 강추!"',
        author: '김지은',
        role: 'Python 입문 수강생',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face',
    },
    {
        content: '"디자이너로서 Figma를 제대로 배우고 싶었는데, 이 강의 보고 실무에 바로 적용하고 있어요. 포트폴리오도 만들었고, 좋은 회사에 입사도 했어요!"',
        author: '한소율',
        role: 'UI/UX 디자인 수강생',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=face',
    },
    {
        content: '"취업 준비하면서 데이터 분석 배우고 싶었는데, 이 강의 정말 최고예요. 이론도 좋지만 실습이 많아서 실무 능력도 쌓을 수 있었어요. 추천합니다!"',
        author: '이준혁',
        role: '데이터 분석 수강생',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
    },
];

function StarIcon() {
    return (
        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    );
}

export default function TestimonialsSection() {
    return (
        <section id="reviews" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <span className="text-coral-500 font-semibold text-sm uppercase tracking-wider">수강 후기</span>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mt-3 mb-4">성장하는 수강생들의 이야기</h2>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">SkillHub와 함께한 수많은 성공 스토리를 확인하세요</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-cream-50 rounded-3xl p-8 hover:-translate-y-1.5 transition-transform duration-300">
                            <div className="flex items-center gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon key={i} />
                                ))}
                            </div>
                            <p className="text-slate-600 mb-6 leading-relaxed">{testimonial.content}</p>
                            <div className="flex items-center gap-3">
                                <Image
                                    src={testimonial.avatar}
                                    alt={testimonial.author}
                                    width={48}
                                    height={48}
                                    className="w-12 h-12 rounded-full"
                                />
                                <div>
                                    <p className="font-semibold text-slate-800">{testimonial.author}</p>
                                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
