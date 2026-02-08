import { AppShell } from "@/components/layout";
import { ClubProvider } from "@/providers";

export default async function PublicLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClubProvider>
			<AppShell>{children}</AppShell>
		</ClubProvider>
	);
}
