import React from "react";

interface CloudIconProps {
  className?: string;
}

export const CloudIcon: React.FC<CloudIconProps> = ({ className }) => {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18 10c0-3.9-3.1-7-7-7S4 6.1 4 10c0 2.8 1.6 5.2 4 6.3V17c0 .6.4 1 1 1h6c.6 0 1-.4 1-1v-.7c2.4-1.1 4-3.5 4-6.3z" />
      <path d="M12 3c-.6 0-1 .4-1 1v1c0 .6.4 1 1 1s1-.4 1-1V4c0-.6-.4-1-1-1zM6.3 6.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l.7.7c.4.4 1 .4 1.4 0s.4-1 0-1.4l-.7-.7zM17.7 6.3l-.7.7c-.4.4-.4 1 0 1.4s1 .4 1.4 0l.7-.7c.4-.4.4-1 0-1.4s-1-.4-1.4 0z" />
    </svg>
  );
};
