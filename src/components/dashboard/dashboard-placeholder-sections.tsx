import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DashboardPlaceholderSectionsProps = {
  summaryTitle: string;
  summaryDescription: string;
  nextStepTitle: string;
  nextStepDescription: string;
};

export function DashboardPlaceholderSections({
  summaryTitle,
  summaryDescription,
  nextStepTitle,
  nextStepDescription,
}: DashboardPlaceholderSectionsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="rounded-[2rem]">
        <CardHeader>
          <p className="km-eyebrow text-xs font-semibold">Section Status</p>
          <CardTitle>{summaryTitle}</CardTitle>
          <CardDescription>{summaryDescription}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm leading-6 text-[var(--on-surface-variant)]">
          <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] p-5">
            The dashboard shell, route protection, and role-based navigation are
            already active for this section.
          </div>
          <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] p-5">
            Data tables, actions, and fetching will be added later without
            changing the protected layout structure.
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem]">
        <CardHeader>
          <p className="km-eyebrow text-xs font-semibold">Next Step</p>
          <CardTitle>{nextStepTitle}</CardTitle>
          <CardDescription>{nextStepDescription}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm leading-6 text-[var(--on-surface-variant)]">
          <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] p-5">
            This page is intentionally lightweight so the real product screens can
            be layered on top of a stable shell.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
