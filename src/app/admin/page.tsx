import Link from "next/link";
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardSectionCard } from "@/components/dashboard/dashboard-section-card";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/constants/routes";

export default function AdminPage() {
  return (
    <DashboardPage
      eyebrow="Admin Dashboard"
      title="Welcome to your administrative workspace."
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DashboardSectionCard
          eyebrow="Overview"
          title="Platform Management"
        >
          <div className="grid gap-4">
            <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5 text-sm leading-6 text-[var(--on-surface-variant)]">
              From this portal, you can oversee teacher accounts, manage classroom assignments, and review system logs to keep operations running smoothly.
            </div>
          </div>
        </DashboardSectionCard>
        
        <DashboardSectionCard
          eyebrow="Quick Links"
          title="Get started"
        >
          <div className="grid gap-4">
             <div className="rounded-[1.75rem] bg-[var(--surface-container-low)] p-5 text-sm leading-6 text-[var(--on-surface-variant)]">
              Jump straight into managing the core records of your platform.
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={APP_ROUTES.adminTeachers}>Manage Teachers</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={APP_ROUTES.adminClasses}>Manage Classes</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={APP_ROUTES.adminMonitoringConfigs}>
                  Monitoring Configs
                </Link>
              </Button>
            </div>
          </div>
        </DashboardSectionCard>
      </div>
    </DashboardPage>
  );
}
