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
    <div className={cn("relative flex items-center gap-2.5", className)}>
      <Image
        src="/images/brand/enigmatic-logo.png"
        alt=""
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      {showText && <span className="text-title-md tracking-[-0.03em]">Enigmatic Partners</span>}
    </div>
  );
}
