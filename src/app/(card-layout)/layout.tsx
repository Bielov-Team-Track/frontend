export default async function CardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="w-full max-w-md relative bg-surface p-6 sm:p-8 rounded-lg shadow-lg flex flex-col justify-center gap-6 min-h-[400px]">{children}</div>
		</div>
	);
}
