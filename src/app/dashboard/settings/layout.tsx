import UserSettingsSidebar from "./components/UserSettingsSidebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-full p-6 lg:p-10 space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Settings</h1>
				<p className="text-muted mt-1">Manage your profile and preferences.</p>
			</div>

			{/* Navigation tabs */}
			<UserSettingsSidebar />

			{/* Content */}
			<div className="min-w-0">{children}</div>
		</div>
	);
}
