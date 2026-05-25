import Link from "next/link";

import { BrandMark } from "@/components/common/brand-mark";
import { getDashboardRouteForRole } from "@/lib/auth/access";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";
import type { DashboardNavItem } from "@/types/navigation";

type DashboardSidebarProps = {
  items: readonly DashboardNavItem[];
  pathname: string;
  role: UserRole;
};

function isNavItemActive(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }

  if (href === "/admin" || href === "/teacher") {
    return false;
  }

  return pathname.startsWith(`${href}/`);
}

export function DashboardSidebar({
  items,
  pathname,
  role,
}: DashboardSidebarProps) {
  return (
    <aside className="km-glass flex h-fit flex-col gap-8 rounded-[2rem] p-5 sm:p-6 lg:sticky lg:top-5 lg:min-h-[calc(100vh-2.5rem)]">
      <div className="flex flex-col gap-4">
        <BrandMark
          className="w-full min-w-0"
          href={getDashboardRouteForRole(role)}
        />
      </div>

      <nav className="flex flex-col gap-2.5">
        {items.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-full px-5 py-3.5 text-[15px] font-medium tracking-tight transition-transform duration-200 hover:scale-[1.01]",
                isActive
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-[var(--on-surface-variant)] hover:bg-[var(--hover-overlay)]",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
