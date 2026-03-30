import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { DashboardPlaceholderSections } from "@/components/dashboard/dashboard-placeholder-sections";

export default function AdminPage() {
  return (
    <DashboardPage
      eyebrow="Admin Dashboard"
      title="Stay on top of the platform from one clear control surface."
      description="This dashboard shell is now wired for role-based navigation, authenticated user display, and clean expansion into operational screens."
    >
      <DashboardPlaceholderSections
        summaryTitle="Admin overview area"
        summaryDescription="This is the main landing screen for administrators. Metrics, approvals, and operational widgets can be added here next."
        nextStepTitle="Build the operational modules"
        nextStepDescription="Teacher management, class management, and system logs already have protected destinations in place."
      />
    </DashboardPage>
  );
}
