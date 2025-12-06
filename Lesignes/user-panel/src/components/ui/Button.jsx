import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    children,
    ...props
}, ref) => {

    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-sm',
        secondary: 'bg-secondary-100 hover:bg-secondary-200 text-secondary-900 border border-secondary-300 focus:ring-secondary-500',
        outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        ghost: 'text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <button
            ref={ref}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
