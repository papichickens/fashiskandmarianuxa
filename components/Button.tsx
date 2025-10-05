// src/components/Button.tsx
import React from 'react';
import { colors } from '../styles/color';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; // Added 'ghost' variant
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = 'px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors duration-200';
  const variantStyles = {
    primary: `bg-[${colors.primaryAccent}] text-white hover:bg-[#6a2526] focus:ring-[${colors.primaryAccent}]`, // Using dynamic Tailwind syntax
    secondary: `bg-[${colors.doneTab}] text-white hover:bg-[#8e9caf] focus:ring-[${colors.doneTab}]`, // Using dynamic Tailwind syntax
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500', // Kept generic red for danger
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300', // New ghost variant
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;