import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    fullWidth?: boolean;
}

const variants = {
    primary: 'btn-primary bg-coral-500 text-white hover:bg-coral-600',
    secondary: 'bg-sage-500 text-white hover:bg-sage-600',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    outline: 'bg-white border border-slate-200 text-slate-700 hover:bg-coral-50',
};

const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    children,
    className = '',
    ...props
}: ButtonProps) {
    return (
        <button
            className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-full font-semibold transition-all duration-300
        flex items-center justify-center gap-2
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
}
