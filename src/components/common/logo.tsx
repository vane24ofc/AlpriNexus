
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  href?: string | null;
  className?: string;
}

export function Logo({ href = "/", className }: LogoProps) {
  const imageSrc = "/width_800.png"; // Make sure to save your logo here
  const imageWidth = 413; // Actual width of your new logo image
  const imageHeight = 326; // Actual height of your new logo image

  const content = (
    <Image
      src={imageSrc}
      alt="NexusAlpri Logo"
      width={imageWidth}
      height={imageHeight}
      className={className}
      priority // Added priority as logos are often LCP elements
    />
  );

  if (href) {
    // The Link component will handle the navigation
    return <Link href={href} legacyBehavior={false}>{content}</Link>;
  }
  // If no href, just return the image (e.g., for display in app header when already on dashboard)
  return content;
}
