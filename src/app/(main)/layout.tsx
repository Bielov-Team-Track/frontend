import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Header, ReactQueryProvider } from "@/components/layout";
import Head from "next/head";
import { AuthProvider } from "@/lib/auth/authContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Team Track",
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
      className="min-h-screen relative bg-background text-background-content"
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
            <div className="min-h-screen-safe bg-background">
              <Header />
              <main className="relative w-full ">{children}</main>
            </div>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
