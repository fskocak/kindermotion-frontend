"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { APP_ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store";
import { ThemeToggle } from "@/theme/theme-toggle";
import type { UserRole } from "@/types/auth";

type DashboardHeaderProps = {
  role: UserRole;
};

const roleMeta = {
  ADMIN: {
    eyebrow: "Admin Workspace",
    title: "Operational control center",
  },
  TEACHER: {
    eyebrow: "Teacher Workspace",
    title: "Classroom Management Space",
  },
} as const;

export function DashboardHeader({ role }: DashboardHeaderProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const profileRoute = role === "TEACHER" ? APP_ROUTES.teacherProfile : null;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="km-glass relative z-30 flex flex-col gap-4 rounded-[2rem] px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="km-eyebrow mb-2 text-xs font-semibold">
          {roleMeta[role].eyebrow}
        </p>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--on-surface)] sm:text-3xl">
          {roleMeta[role].title}
        </h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-end">
        <div ref={menuRef} className="relative z-40">
          <button
            type="button"
            className="flex w-full min-w-[18rem] items-center justify-between gap-4 rounded-[1.6rem] border border-[var(--panel-border)] bg-[var(--surface-container)] px-4 py-3 text-left transition-colors hover:bg-[var(--hover-overlay)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] sm:w-auto sm:min-w-[19rem]"
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--on-surface-variant)]">
                Signed in
              </p>
              <p className="truncate text-sm font-medium text-[var(--on-surface)]">
                {user?.email ?? "Unknown user"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="primary">{role}</Badge>
              <ChevronDown
                className={`size-4 text-[var(--on-surface-variant)] transition-transform ${isMenuOpen ? "rotate-180" : ""
                  }`}
              />
            </div>
          </button>

          {isMenuOpen ? (
            <div className="km-panel absolute right-0 top-[calc(100%+0.75rem)] z-50 grid min-w-[15rem] gap-1 rounded-[1.5rem] p-2">
              {profileRoute ? (
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-[1.1rem] px-3 py-3 text-sm font-medium text-[var(--on-surface)] transition-colors hover:bg-[var(--hover-overlay)]"
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push(profileRoute);
                  }}
                >
                  <UserRound className="size-4 text-[var(--on-surface-variant)]" />
                  My Profile
                </button>
              ) : null}
              <button
                type="button"
                className="flex items-center gap-3 rounded-[1.1rem] px-3 py-3 text-sm font-medium text-[var(--on-surface)] transition-colors hover:bg-[var(--hover-overlay)]"
                onClick={logout}
              >
                <LogOut className="size-4 text-[var(--on-surface-variant)]" />
                Logout
              </button>
            </div>
          ) : null}
        </div>

        <ThemeToggle className="self-end sm:self-auto" />
      </div>
    </header>
  );
}
