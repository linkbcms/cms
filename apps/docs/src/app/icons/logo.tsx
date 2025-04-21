import React from 'react';
import type { SVGProps } from 'react';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    {...props}
  >
    <title>LinkbCMS Logo</title>
    <path stroke="none" d="M0 0h24v24H0z" />
    <path d="M15 6 8 18M20 6l-7 12M5 14v.015M5 10.015v.015" />
  </svg>
);
