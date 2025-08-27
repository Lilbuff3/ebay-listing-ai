import React from 'react';

interface SparklesIconProps {
  className?: string;
}

export function SparklesIcon({ className = "w-6 h-6" }: SparklesIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3l1.5 1.5L5 6 3.5 4.5 5 3zM19 3l1.5 1.5L19 6l-1.5-1.5L19 3zM12 10l2 2-2 2-2-2 2-2zM5 17l1.5 1.5L5 20l-1.5-1.5L5 17zM19 17l1.5 1.5L19 20l-1.5-1.5L19 17z"
      />
    </svg>
  );
}