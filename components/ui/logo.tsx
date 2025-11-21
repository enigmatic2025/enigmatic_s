import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export function Logo({
  className,
  width = 40,
  height = 40,
  showText = false,
}: LogoProps) {
  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <Image
        src="/images/brand/enigmatic-logo.png"
        alt="Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      {showText && <span className="text-xl font-normal">Enigmatic</span>}
    </div>
  );
}
