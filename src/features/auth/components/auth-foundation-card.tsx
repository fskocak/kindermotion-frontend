import { ArchitectureCard } from "@/components/common/architecture-card";
import { env } from "@/lib/config/env";
import { API_ROUTES } from "@/lib/constants/api-routes";
import { APP_ROUTES } from "@/lib/constants/routes";

const authEndpoints = [
  `POST ${API_ROUTES.auth.adminLogin}`,
  `POST ${API_ROUTES.auth.teacherLogin}`,
  `GET ${API_ROUTES.auth.me}`,
];

const appFolders = [
  "src/app -> Next routes",
  "src/components -> reusable UI layer",
  "src/features -> domain-based modules",
  "src/lib -> axios, config, helpers, constants",
  "src/services -> request layer",
  "src/store -> Zustand store entry point",
  "src/types -> shared TypeScript models",
];

const nextSteps = [
  `API base URL: ${env.apiBaseUrl}`,
  `Planned admin login: ${APP_ROUTES.adminLogin}`,
  `Planned teacher login: ${APP_ROUTES.teacherLogin}`,
];

export function AuthFoundationCard() {
  return (
    <ArchitectureCard
      title="Auth and API Foundation"
      description="The shared Axios instance is configured, and auth requests are separated into the service layer to match the backend endpoints."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Endpoints
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            {authEndpoints.map((endpoint) => (
              <li key={endpoint} className="rounded-xl bg-white px-3 py-2">
                {endpoint}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Folders
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            {appFolders.map((folder) => (
              <li key={folder} className="rounded-xl bg-white px-3 py-2">
                {folder}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Next Steps
          </h3>
          <ul className="space-y-2 text-sm text-slate-700">
            {nextSteps.map((item) => (
              <li key={item} className="rounded-xl bg-white px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ArchitectureCard>
  );
}
