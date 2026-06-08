interface BrandLogoProps {
  size?: number;
  className?: string;
}

export default function BrandLogo({ size = 48, className = "" }: BrandLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Tiger Head"
      className={`rounded-xl bg-white object-contain shadow-sm ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
