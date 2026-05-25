"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FeedbackBox } from "@/components/ui/feedback-box";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loginFormSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login-form-schema";
import { APP_ROUTES } from "@/lib/constants/routes";
import { getApiErrorMessage } from "@/lib/http/get-api-error-message";
import { useAuthStore } from "@/store";
import { cn } from "@/lib/utils";

type LoginFormProps = {
  mode: "admin" | "teacher";
  title: string;
  description: string;
};

const modeToAlternateRoute = {
  admin: APP_ROUTES.teacherLogin,
  teacher: APP_ROUTES.adminLogin,
} as const;

const modeToAlternateLabel = {
  admin: "Switch to teacher login",
  teacher: "Switch to admin login",
} as const;

const modeToDestination = {
  admin: APP_ROUTES.admin,
  teacher: APP_ROUTES.teacher,
} as const;

export function LoginForm({ mode, title, description }: LoginFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const loginAdmin = useAuthStore((state) => state.loginAdmin);
  const loginTeacher = useAuthStore((state) => state.loginTeacher);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null);

    try {
      if (mode === "admin") {
        await loginAdmin(values);
      } else {
        await loginTeacher(values);
      }

      router.replace(modeToDestination[mode]);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  }

  return (
    <Card className="rounded-[2rem] p-6 sm:p-8">
      <CardHeader className="gap-3">
        <p className="km-eyebrow text-xs font-semibold">
          {mode === "admin" ? "Admin Auth" : "Teacher Auth"}
        </p>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor={`${mode}-email`}>Email</Label>
            <Input
              id={`${mode}-email`}
              type="email"
              autoComplete="email"
              placeholder="name@kindermotion.com"
              {...form.register("email")}
            />
            {form.formState.errors.email ? (
              <p className="text-sm text-[var(--error)]">
                {form.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${mode}-password`}>Password</Label>
            <Input
              id={`${mode}-password`}
              type="password"
              autoComplete="current-password"
              placeholder="At least 8 characters"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-sm text-[var(--error)]">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          {submitError ? (
            <FeedbackBox
              variant="error"
              description={
                submitError === "Invalid credentials"
                  ? "Invalid email or password. Please try again."
                  : submitError
              }
            />
          ) : (
            <div className="rounded-[1.5rem] bg-[var(--surface-container-low)] px-4 py-3 text-sm text-[var(--on-surface-variant)] transition-all duration-300">
              Enter your credentials to securely sign in.
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin" />
                Signing in
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--on-surface-variant)]">
            {isBootstrapping
              ? "Checking for a saved session..."
              : "Secure access to your professional workspace."}
          </p>
          <Button asChild variant="ghost" size="sm">
            <Link href={modeToAlternateRoute[mode]}>
              {modeToAlternateLabel[mode]}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
