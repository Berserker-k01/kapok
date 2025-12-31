import React from 'react';

const Input = React.forwardRef(({
    className = '',
    label,
    error,
    type = 'text',
    ...props
}, ref) => {
    return (
        <div className="space-y-1">
            {label && (
                <label className="block text-sm font-medium text-secondary-700">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`
          w-full px-3 py-2 border rounded-lg bg-white text-secondary-900 
          placeholder-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
          transition-colors disabled:bg-secondary-50 disabled:text-secondary-500
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-secondary-300'}
          ${className}
        `}
                ref={ref}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
