import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { brand } from "@/theme/brand";

type BrandMarkProps = {
  className?: string;
  href?: string;
};

export function BrandMark({ className, href = "/" }: BrandMarkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 transition-transform duration-300 ease-out hover:translate-y-[-1px]",
        className,
      )}
    >
      <span className="relative flex size-14 items-center justify-center overflow-hidden rounded-[1.55rem] shadow-[0_18px_40px_rgba(15,23,42,0.14)] transition-all duration-300 ease-out group-hover:shadow-[0_22px_48px_rgba(15,23,42,0.18)]">
        <Image
          src="/KinderMotion.png"
          alt="KinderMotion logo"
          fill
          sizes="56px"
          priority
          quality={100}
          className="h-full w-full rounded-[1.55rem] object-cover"
        />
      </span>
      <span className="flex flex-col">
        <span className="text-lg font-bold tracking-[-0.04em] text-[var(--on-surface)]">
          {brand.name}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--on-surface-variant)]">
          {brand.signature}
        </span>
      </span>
    </Link>
  );
}
