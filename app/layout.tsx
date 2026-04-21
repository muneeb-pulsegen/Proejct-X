import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "InjuryX",
  description: "Secure injury reporting for players and team oversight for coaches."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="relative min-h-screen overflow-x-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0)_0%,_rgba(219,234,254,0.32)_100%)]" />
          <Navbar />
          <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-16 pt-24 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
