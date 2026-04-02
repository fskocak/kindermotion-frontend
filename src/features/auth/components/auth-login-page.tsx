import { LoginForm } from "@/features/auth/components/login-form";
import { AuthPageShell } from "@/features/auth/components/auth-page-shell";

type AuthLoginPageProps = {
  mode: "admin" | "teacher";
};

const authPageContent = {
  admin: {
    eyebrow: "Administrative Access",
    title: "Secure admin access for managing KinderMotion.",
    description:
      "Sign in to access the administrative dashboard.",
    formTitle: "Admin login",
    formDescription:
      "Enter your account details to access the administrative workspace.",
  },
  teacher: {
    eyebrow: "Teacher Workspace",
    title: "A calm and intentional space for your classroom.",
    description:
      "Sign in to access your teacher portal and class assignments.",
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
    >
      <LoginForm
        mode={mode}
        title={content.formTitle}
        description={content.formDescription}
      />
    </AuthPageShell>
  );
}
