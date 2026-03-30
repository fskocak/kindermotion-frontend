import { LoginForm } from "@/features/auth/components/login-form";
import { AuthPageShell } from "@/features/auth/components/auth-page-shell";

type AuthLoginPageProps = {
  mode: "admin" | "teacher";
};

const authPageContent = {
  admin: {
    eyebrow: "Administrative Access",
    title: "Manage your administrative workflows with clarity, calm, and control.",
    description:
      "After admin sign-in, the JWT is stored, `/auth/me` restores the session, and the user is redirected into the admin flow.",
    highlights: [
      "All auth requests go through the shared service layer.",
      "State management stays simple and scalable with Zustand.",
      "The form experience is validated with React Hook Form and Zod.",
    ],
    formTitle: "Admin login",
    formDescription:
      "Enter your account details to access the administrative workspace.",
  },
  teacher: {
    eyebrow: "Teacher Workspace",
    title: "Give the teacher flow the same calm, intentional, and fast experience.",
    description:
      "The teacher login uses the same session restore flow as admin; only the destination route and role-specific experience differ.",
    highlights: [
      "The shared login form uses the same component architecture for both roles.",
      "The token helper and store work together consistently.",
      "The same theme layer can now be extended into future dashboard screens.",
    ],
    formTitle: "Teacher login",
    formDescription:
      "Sign in with your teacher account to access class and observation workflows.",
  },
} as const;

export function AuthLoginPage({ mode }: AuthLoginPageProps) {
  const content = authPageContent[mode];

  return (
    <AuthPageShell
      eyebrow={content.eyebrow}
      title={content.title}
      description={content.description}
      highlights={content.highlights}
    >
      <LoginForm
        mode={mode}
        title={content.formTitle}
        description={content.formDescription}
      />
    </AuthPageShell>
  );
}
