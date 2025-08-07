import React from 'react';

// Template for your custom SVG icon
const CustomIcon = ({ className = '', size = 24, color = 'currentColor', ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24" // Update this to match your SVG's viewBox
      fill="none"
      className={className}
      {...props}
    >
      {/* 
        Replace this comment with your SVG content
        
        Example:
        <path 
          d="M12 2L2 7L12 12L22 7L12 2Z" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        
        Just copy the path/content from your SVG file and paste it here
      */}
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default CustomIcon;
