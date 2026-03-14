import type { Metadata } from "next";
import { HubShell } from "./HubShell";

export const metadata: Metadata = {
	robots: { index: false, follow: false },
};

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <HubShell>{children}</HubShell>;
}
