import * as React from "react";
import { SVGProps } from "react";
export const ThreadsLogoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={32}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M19 7.5c-1.333-3-3.833-4.5-7-4.5-4.418 0-8 3.582-8 8s3.582 8 8 8c3.167 0 5.667-1.5 7-4.5" />
    <path d="M19 7.5A6.5 6.5 0 0 1 19 16.5" />
    <path d="M19 12a4 4 0 0 0-4-4c-3 0-4.5 1.5-4.5 4s1.5 4 4.5 4" />
  </svg>
);
export default ThreadsLogoIcon;
