import Link from "next/link";

import { BrandMark } from "@/components/common/brand-mark";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DashboardNavItem } from "@/types/navigation";
import type { UserRole } from "@/types/auth";

type DashboardSidebarProps = {
  role: UserRole;
  items: readonly DashboardNavItem[];
  pathname: string;
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
  role,
  items,
  pathname,
}: DashboardSidebarProps) {
  return (
    <aside className="km-glass flex h-fit flex-col gap-6 rounded-[2rem] p-5 sm:p-6 lg:sticky lg:top-4 lg:min-h-[calc(100vh-2rem)]">
      <div className="flex items-start justify-between gap-3">
        <BrandMark />
        <Badge variant="primary">{role}</Badge>
      </div>

      <nav className="flex flex-col gap-2">
        {items.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium tracking-tight transition-transform duration-200 hover:scale-[1.01]",
                isActive
                  ? "bg-[rgba(14,165,233,0.12)] text-[var(--primary)]"
                  : "text-[var(--on-surface-variant)] hover:bg-white/50",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[1.75rem] bg-[rgba(255,255,255,0.68)] p-5">
        <p className="km-eyebrow mb-3 text-xs font-semibold">Workspace</p>
        <p className="text-sm leading-6 text-[var(--on-surface-variant)]">
          This protected area now shares one navigation system, one visual shell,
          and one place for role-based expansion.
        </p>
      </div>
    </aside>
  );
}
