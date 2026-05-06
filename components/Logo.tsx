import React from 'react';

export const Logo: React.FC<{
  className?: string;
  size?: number;
}> = ({ className = '', size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <g transform="translate(50,50)">
      {/* 5-figure circular logo mimicking the uploaded image */}
      {/* Figure 1 (Top) */}
      <g transform="rotate(0)">
        <circle cx="0" cy="-32" r="8" fill="#4B9CB5" />
        <path d="M -16,-18 Q 0,-10 16,-18 Q 12,5 0,15 Q -12,5 -16,-18 Z" fill="#4B9CB5" />
      </g>
      {/* Figure 2 (Right) */}
      <g transform="rotate(72)">
        <circle cx="0" cy="-32" r="8" fill="#69B5C9" />
        <path d="M -16,-18 Q 0,-10 16,-18 Q 12,5 0,15 Q -12,5 -16,-18 Z" fill="#69B5C9" />
      </g>
      {/* Figure 3 (Bottom Right) */}
      <g transform="rotate(144)">
        <circle cx="0" cy="-32" r="8" fill="#78C1D6" />
        <path d="M -16,-18 Q 0,-10 16,-18 Q 12,5 0,15 Q -12,5 -16,-18 Z" fill="#78C1D6" />
      </g>
      {/* Figure 4 (Bottom Left) */}
      <g transform="rotate(216)">
        <circle cx="0" cy="-32" r="8" fill="#65B1C5" />
        <path d="M -16,-18 Q 0,-10 16,-18 Q 12,5 0,15 Q -12,5 -16,-18 Z" fill="#65B1C5" />
      </g>
      {/* Figure 5 (Top Left) */}
      <g transform="rotate(288)">
        <circle cx="0" cy="-32" r="8" fill="#206A7F" />
        <path d="M -16,-18 Q 0,-10 16,-18 Q 12,5 0,15 Q -12,5 -16,-18 Z" fill="#206A7F" />
      </g>
      <circle cx="0" cy="0" r="14" fill="#ffffff" />
    </g>
  </svg>
);
