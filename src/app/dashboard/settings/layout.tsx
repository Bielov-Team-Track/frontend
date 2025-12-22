import UserSettingsSidebar from "./components/UserSettingsSidebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-full p-6 lg:p-10 space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Settings</h1>
				<p className="text-muted mt-1">Manage your profile and preferences.</p>
			</div>

			{/* Content with sidebar */}
			<div className="flex flex-col md:flex-row gap-8">
				<UserSettingsSidebar />
				<div className="flex-1 min-w-0">{children}</div>
			</div>
		</div>
	);
}
