import Image from "next/image";
import { cn } from "@/lib/utils";

/** `sizes` presets matching the page wrapper (see the `wrap` utility). */
export const imageSizes = {
  wide: "(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 64px), (max-width: 1296px) calc(100vw - 96px), 1200px",
  half: "(max-width: 767px) calc(100vw - 40px), (max-width: 1296px) 45vw, 576px",
} as const;

type MediaProps = {
  src: string;
  alt: string;
  /** A preset name or a raw `sizes` string. */
  sizes?: keyof typeof imageSizes | (string & {});
  priority?: boolean;
  /** Soft bottom fade so bright photos settle into the dark ground (no-op in light). */
  scrim?: boolean;
  caption?: React.ReactNode;
  /** Sizing for the frame — give it a height or aspect ratio. */
  className?: string;
  imgClassName?: string;
};

/** Photo in a crisp 6px frame with a hairline edge. */
export function Media({ src, alt, sizes = "wide", priority, scrim, caption, className, imgClassName }: MediaProps) {
  const frame = (
    <div className={cn("relative overflow-hidden rounded-md bg-surface-1", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes in imageSizes ? imageSizes[sizes as keyof typeof imageSizes] : sizes}
        className={cn("object-cover", imgClassName)}
      />
      {scrim && <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-t from-(--scrim) via-transparent to-transparent" />}
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-md ring-1 ring-border ring-inset" />
    </div>
  );
  if (!caption) return frame;
  return (
    <figure>
      {frame}
      <figcaption className="mt-3.5 text-caption text-subtle">{caption}</figcaption>
    </figure>
  );
}
