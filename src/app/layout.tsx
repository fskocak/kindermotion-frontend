import type { Metadata } from "next";

import { AuthBootstrapper } from "@/components/providers/auth-bootstrapper";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ThemeScript } from "@/theme/theme-script";
import "@/theme/index.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "KinderMotion",
  description: "KinderMotion auth shell and shared theme foundation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      data-theme="dark"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans text-foreground">
        <ThemeScript />
        <ToastProvider>
          <AuthBootstrapper />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
