import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  themeColor?: string; // CSS color string
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  themeColor = 'currentColor',
  ...props 
}) => {
  const baseStyles = "font-mono uppercase tracking-widest border-2 transition-all duration-100 focus:outline-none active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group";
  
  // Dynamic styles based on current theme color would be ideal, but we'll use classes + style overrides where needed
  // For retro feel, we use borders and hover fills
  
  const variants = {
    primary: "bg-transparent hover:bg-white hover:text-black", // Default fallback, overridden by style
    secondary: "bg-transparent border-dashed opacity-70 hover:opacity-100",
    danger: "bg-transparent border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
    outline: "bg-transparent"
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-6 py-2 text-lg",
    lg: "px-8 py-4 text-2xl"
  };

  const style: React.CSSProperties = {};
  if (variant === 'primary' || variant === 'outline') {
    style.borderColor = themeColor;
    style.color = themeColor;
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={style}
      {...props}
    >
      {/* Hover fill effect for Primary */}
      {variant === 'primary' && (
         <div className="absolute inset-0 bg-current opacity-0 group-hover:opacity-100 transition-opacity duration-100 -z-10"></div>
      )}
      <span className={variant === 'primary' ? "group-hover:text-black group-hover:mix-blend-screen font-bold" : "font-bold"}>
        {children}
      </span>
    </button>
  );
};