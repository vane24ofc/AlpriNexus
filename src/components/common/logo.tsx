import type { SVGProps } from 'react';
import Link from 'next/link';

interface LogoProps extends SVGProps<SVGSVGElement> {
  href?: string;
  className?: string;
}

export function Logo({ href = "/", className, ...props }: LogoProps) {
  const content = (
    <svg
      width="150"
      height="36"
      viewBox="0 0 150 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
      aria-label="AlpriNexus Logo"
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap');
          .logo-text { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 24px; }
          .text-primary { fill: hsl(var(--primary-foreground)); }
          .text-accent-gold { fill: #B8860B; }
        `}
      </style>
      <text x="0" y="27" className="logo-text">
        <tspan className="text-accent-gold">A</tspan>
        <tspan className="text-primary">lpri</tspan>
        <tspan className="text-accent-gold">N</tspan>
        <tspan className="text-primary">exus</tspan>
      </text>
    </svg>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
