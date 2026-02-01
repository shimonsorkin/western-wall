import * as React from "react";
import { SVGProps } from "react";
export const BlueskyLogoIcon = (props: SVGProps<SVGSVGElement>) => (
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
    <path d="M12 3c-2.4 2.4-5.5 6-5.5 8.5a5.5 5.5 0 0 0 5 5.48V20a4 4 0 0 1-4 1" />
    <path d="M12 3c2.4 2.4 5.5 6 5.5 8.5a5.5 5.5 0 0 1-5 5.48V20a4 4 0 0 0 4 1" />
  </svg>
);
export default BlueskyLogoIcon;
