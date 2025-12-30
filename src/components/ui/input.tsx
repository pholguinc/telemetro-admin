// components/ui/input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input: React.FC<InputProps> = ({ 
  className = '',
  error,
  ...props 
}) => {
  const baseStyles = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors';
  const errorStyles = error 
    ? 'border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  return (
    <div className="w-full">
      <input
        className={`${baseStyles} ${errorStyles} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};