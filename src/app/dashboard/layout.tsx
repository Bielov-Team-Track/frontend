import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import {
  ReactQueryProvider,
  DashboardHeader,
  MobileNav,
} from "@/components/layout";
import Head from "next/head";
import { AuthProvider } from "@/lib/auth/authContext";
import { Sidebar } from "@/components/layout/";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Volleyer",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="min-h-screen relative bg-[#3D3D3D] text-background-content"
    >
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        ></meta>
      </Head>
      <body
        className={`${inter.className} min-h-screen-safe flex flex-col text-mobile-base sm:text-tablet-base lg:text-desktop-base antialiased`}
      >
        <AuthProvider>
          <ReactQueryProvider>
            <div className="min-h-screen-safe flex gap-4 sm:p-8">
              <div className="hidden sm:flex">
                <Sidebar />
              </div>
              <div className="flex flex-col gap-4 flex-1">
                <DashboardHeader />
                <main className="flex-1 relative w-full rounded-lg bg-background overflow-auto">
                  {children}
                </main>
              </div>
              <MobileNav />
            </div>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
