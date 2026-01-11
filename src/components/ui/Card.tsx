import Image from 'next/image';
import Badge from './Badge';
import StarRating from './StarRating';

interface CourseCardProps {
    title: string;
    description: string;
    image: string;
    category: string;
    level: string;
    instructor: {
        name: string;
        avatar: string;
    };
    rating: number;
    reviews: number;
    students: number;
    price: number;
    originalPrice?: number;
    badge?: string;
    badgeColor?: 'coral' | 'sage' | 'blue';
}

export default function Card({
    title,
    description,
    image,
    category,
    level,
    instructor,
    rating,
    reviews,
    students,
    price,
    originalPrice,
    badge,
    badgeColor = 'coral',
}: CourseCardProps) {
    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm card-hover group">
            <div className="relative h-48 overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {badge && <Badge text={badge} color={badgeColor} />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-sage-100 text-sage-600 rounded text-xs font-medium">{category}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">{level}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-coral-500 transition-colors">{title}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{description}</p>

                <div className="flex items-center gap-3 mb-4">
                    <Image src={instructor.avatar} alt={instructor.name} width={32} height={32} className="rounded-full" />
                    <span className="text-sm text-slate-600">{instructor.name}</span>
                </div>

                <div className="flex items-center justify-between">
                    <StarRating rating={rating} reviews={reviews} />
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-sm text-slate-500">{students.toLocaleString()}명</span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            {originalPrice && (
                                <span className="text-lg text-slate-400 line-through mr-2">₩{originalPrice.toLocaleString()}</span>
                            )}
                            <span className="text-2xl font-bold text-slate-800">₩{price.toLocaleString()}</span>
                        </div>
                        <button className="w-10 h-10 bg-coral-100 text-coral-500 rounded-full flex items-center justify-center hover:bg-coral-500 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
