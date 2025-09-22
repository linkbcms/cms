import type { SVGProps } from 'react';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    height={24}
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
    width={24}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>LinkbCMS Logo</title>
    <path d="M0 0h24v24H0z" stroke="none" />
    <path d="M15 6 8 18M20 6l-7 12M5 14v.015M5 10.015v.015" />
  </svg>
);
