interface BadgeProps {
    text: string;
    color?: 'coral' | 'sage' | 'blue' | 'amber';
}

const colorClasses = {
    coral: 'bg-coral-500',
    sage: 'bg-sage-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
};

export default function Badge({ text, color = 'coral' }: BadgeProps) {
    return (
        <div className={`absolute top-4 left-4 ${colorClasses[color]} text-white px-3 py-1 rounded-full text-sm font-medium`}>
            {text}
        </div>
    );
}
