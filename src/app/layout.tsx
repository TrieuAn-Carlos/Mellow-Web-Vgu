import type { Metadata } from "next";
import "./globals.css";
import "@/styles/globals.css";
import "@/lib/browser-extension-fix.js";
import { AppInitializer } from "@/components/AppInitializer";

export const metadata: Metadata = {
  title: "Mellow - Where tasks breathe, not scream",
  description:
    "A task system that lives in both worlds, so you can focus on what matters most",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppInitializer>{children}</AppInitializer>
      </body>
    </html>
  );
}
