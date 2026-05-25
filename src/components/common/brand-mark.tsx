import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { brand } from "@/theme/brand";

type BrandMarkProps = {
  className?: string;
  href?: string | null;
};

export function BrandMark({ className, href = "/" }: BrandMarkProps) {
  const classNames = cn(
    "group inline-flex min-w-0 items-center gap-3 transition-transform duration-300 ease-out hover:translate-y-[-1px]",
    className,
  );
  const content = (
    <>
      <span className="relative flex size-14 items-center justify-center overflow-hidden rounded-[1.55rem] shadow-[var(--shadow-brand)] transition-all duration-300 ease-out group-hover:shadow-[var(--shadow-soft)]">
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
      <span className="flex min-w-0 flex-col">
        <span className="text-lg font-bold tracking-[-0.04em] text-[var(--on-surface)]">
          {brand.name}
        </span>
        <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--on-surface-variant)]">
          {brand.signature}
        </span>
      </span>
    </>
  );

  if (!href) {
    return <div className={classNames}>{content}</div>;
  }

  return (
    <Link href={href} className={classNames}>
      {content}
    </Link>
  );
}
