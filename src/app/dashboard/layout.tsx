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
            <div className="min-h-screen-safe grid">
              <div className="fixed left-8 top-8 bottom-8">
                <Sidebar />
              </div>
              <div className="fixed right-8 left-96 top-8 bottom-8 flex flex-col gap-8">
                <DashboardHeader />
                <main className="flex-1 relative w-full rounded-lg h-full bg-background overflow-scroll">
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
