import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import { AuthBootstrapper } from "@/components/providers/auth-bootstrapper";
import { ToastProvider } from "@/components/providers/toast-provider";
import "@/theme/index.css";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

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
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-foreground">
        <ToastProvider>
          <AuthBootstrapper />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
