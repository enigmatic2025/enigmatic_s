import React from "react";

export const NodalNLogo = ({
  className = "",
  size = 64,
}: {
  className?: string;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient
        id="nodal-n-gradient"
        x1="0"
        y1="0"
        x2="64"
        y2="64"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6EC1E4" />
        <stop offset="1" stopColor="#C084FC" />
      </linearGradient>
      <filter
        id="glow"
        x="-10"
        y="-10"
        width="84"
        height="84"
        filterUnits="userSpaceOnUse"
      >
        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#glow)">
      <path
        d="M16 56V8L48 56V8"
        stroke="url(#nodal-n-gradient)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="8" r="4" fill="#fff" />
      <circle cx="48" cy="8" r="4" fill="#fff" />
      <circle cx="16" cy="56" r="4" fill="#fff" />
      <circle cx="48" cy="56" r="4" fill="#fff" />
    </g>
  </svg>
);
