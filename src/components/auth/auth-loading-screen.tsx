import { LoaderCircle } from "lucide-react";

import { BrandMark } from "@/components/common/brand-mark";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <div className="km-glass rounded-[2rem] px-6 py-5 sm:px-8">
          <BrandMark />
        </div>

        <Card className="rounded-[2rem]">
          <CardHeader>
            <p className="km-eyebrow text-xs font-semibold">Auth Status</p>
            <CardTitle>Preparing your workspace</CardTitle>
            <CardDescription>
              We are restoring your session and verifying access before the route
              is rendered.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-[var(--on-surface-variant)]">
            <LoaderCircle className="size-4 animate-spin text-[var(--primary)]" />
            Checking your authentication state...
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
