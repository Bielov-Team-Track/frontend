export default async function NoLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="min-h-screen-safe grid bg-background">
			<main className="relative w-full">{children}</main>
		</div>
	);
}
