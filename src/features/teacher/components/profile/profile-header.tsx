import { Star, Edit2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  name: string;
  age: number;
  level: string;
  enrolledDate: string;
  imageUrl?: string;
}

export function ProfileHeader({
  name,
  age,
  level,
  enrolledDate,
  imageUrl,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-8">
      <div className="flex items-center gap-8">
        <div className="relative size-32 shrink-0">
          <div className="km-panel flex size-full items-center justify-center overflow-hidden rounded-[2rem] bg-[var(--surface-container)] shadow-[var(--shadow-cloud)]">
            {imageUrl ? (
              <span className="text-sm font-medium text-[var(--on-surface-variant)]">
                Avatar linked
              </span>
            ) : (
              <span className="text-3xl font-semibold text-[var(--on-surface)]">
                {name.slice(0, 1)}
              </span>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 flex size-10 items-center justify-center rounded-full border-[3px] border-[var(--surface)] bg-[var(--primary)] text-[var(--button-foreground)] shadow-[var(--shadow-button)]">
            <Star className="size-5 fill-current" />
          </div>
        </div>

        <div className="flex flex-col">
          <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
            Student Profile
          </span>
          <h1 className="mb-4 text-5xl font-bold leading-none tracking-[-0.04em] text-[var(--on-surface)]">
            {name}
          </h1>

          <div className="flex items-center gap-6 text-sm font-medium text-[var(--outline)]">
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
                <path d="m9 16 2 2 4-4" />
              </svg>
              Age {age}
            </div>
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Level: {level}
            </div>
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              Enrolled {enrolledDate}
            </div>
          </div>
        </div>
      </div>

      <div>
        <Button className="gap-2 rounded-[2rem] px-6 shadow-[var(--shadow-button)] hover:shadow-[var(--shadow-soft)]">
          <Edit2 className="size-4" />
          Update Stats
        </Button>
      </div>
    </div>
  );
}
