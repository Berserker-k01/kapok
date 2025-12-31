import React from 'react';

export const Card = ({ className = '', children, ...props }) => (
    <div className={`bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 overflow-hidden transition-colors duration-300 ${className}`} {...props}>
        {children}
    </div>
);

export const CardHeader = ({ className = '', children, ...props }) => (
    <div className={`px-6 py-4 border-b border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/50 ${className}`} {...props}>
        {children}
    </div>
);

export const CardBody = ({ className = '', children, ...props }) => (
    <div className={`p-6 ${className}`} {...props}>
        {children}
    </div>
);

export const CardFooter = ({ className = '', children, ...props }) => (
    <div className={`px-6 py-4 border-t border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/50 ${className}`} {...props}>
        {children}
    </div>
);
