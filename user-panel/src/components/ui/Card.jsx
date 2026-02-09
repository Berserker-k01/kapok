import React from 'react';

export const Card = ({ className = '', children, ...props }) => (
    <div className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-secondary-100 ${className}`} {...props}>
        {children}
    </div>
);

export const CardHeader = ({ className = '', children, ...props }) => (
    <div className={`px-6 py-4 border-b border-secondary-100 bg-secondary-50/50 ${className}`} {...props}>
        {children}
    </div>
);

export const CardBody = ({ className = '', children, ...props }) => (
    <div className={`p-6 ${className}`} {...props}>
        {children}
    </div>
);

export const CardFooter = ({ className = '', children, ...props }) => (
    <div className={`px-6 py-4 border-t border-secondary-100 bg-secondary-50/50 ${className}`} {...props}>
        {children}
    </div>
);
