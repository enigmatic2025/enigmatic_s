import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'dark' }) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const colors = {
    light: 'text-white',
    dark: 'text-black',
  };

  return (
    <div className={`${sizes[size]} ${colors[variant]} flex items-center justify-center`}>
      {/* Replace this with your actual logo SVG or image */}
      <svg
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" />
        <text
          x="50"
          y="60"
          textAnchor="middle"
          fontSize="40"
          fontWeight="bold"
          fill="currentColor"
        >
          E
        </text>
      </svg>
    </div>
  );
};
