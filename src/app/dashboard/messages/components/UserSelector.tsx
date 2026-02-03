import { Input, Loader } from "@/components";
import { useDebounce } from "@/hooks/useDebounce";
import { searchUsers as searchUsersAPI } from "@/lib/api/user";
import { UserProfile } from "@/lib/models/User";
import { stringToColor } from "@/lib/utils/color";
import { Check, Search, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type UserSelectorProps = {
	selectedUsers: UserProfile[];
	onSelectedUsersChange: (users: UserProfile[]) => void;
	excludedUserIds?: string[];
};

const UserSelector = ({ selectedUsers, onSelectedUsersChange, excludedUserIds = [] }: UserSelectorProps) => {
	const [users, setUsers] = useState<UserProfile[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const searchUsers = (term: string) => {
		setError(null);
		if (term.length < 3) {
			setUsers([]);
			return;
		}
		setIsLoading(true);

		searchUsersAPI(term)
			.then((data) => {
				const filteredData = data.filter((u) => !excludedUserIds.includes(u.userId));
				setUsers(filteredData);
				setIsLoading(false);
			})
			.catch((err) => {
				setError("Failed to search users");
				setIsLoading(false);
			});
	};

	const searchUsersDebounced = useDebounce(searchUsers, 300);

	const handleSearchChange = (term: string) => {
		setSearchQuery(term);
		searchUsersDebounced(term);
	};

	const toggleUser = (user: UserProfile) => {
		const isSelected = selectedUsers.some((u) => u.id === user.id);

		if (isSelected) {
			onSelectedUsersChange(selectedUsers.filter((u) => u.id !== user.id));
		} else {
			onSelectedUsersChange([...selectedUsers, user]);
		}
	};

	const removeSelected = (userId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		onSelectedUsersChange(selectedUsers.filter((u) => u.id !== userId));
	};

	const UserAvatar = ({ profile }: { profile: UserProfile }) => {
		const initials = (profile.name || "?")
			.split(" ")
			.map((w) => w[0])
			.join("")
			.slice(0, 2)
			.toUpperCase();
		const bgColor = stringToColor(profile.email || "default");

		return (
			<div
				className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 relative select-none"
				style={{ backgroundColor: !profile.imageUrl ? bgColor : undefined }}>
				{profile.imageUrl ? (
					<Image src={profile.imageUrl} alt={profile.name} fill className="object-cover" />
				) : (
					<span className="font-bold text-black/70 text-xs">{initials}</span>
				)}
			</div>
		);
	};

	return (
		<div className="flex flex-col h-full bg-background/50">
			{/* Search Input */}
			<div className="p-3 border-b border-white/5 space-y-3">
				{/* Selected Chips */}
				{selectedUsers.length > 0 && (
					<div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
						{selectedUsers.map((user) => (
							<div
								key={user.id}
								className="flex items-center gap-1 pl-2 pr-1 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium border border-accent/20 animate-in fade-in zoom-in duration-200">
								<span>
									{user.name} {user.surname}
								</span>
								<button onClick={(e) => removeSelected(user.id, e)} className="p-0.5 hover:bg-black/20 rounded-full transition-colors">
									<X size={12} />
								</button>
							</div>
						))}
					</div>
				)}

				<div className="relative">
					<Input
						type="text"
						leftIcon={<Search className="absolute left-3 top-2.5 text-muted" size={18} />}
						value={searchQuery}
						onChange={(e) => handleSearchChange(e.target.value)}
						placeholder="Search to add..."
						className="bg-white/5 border-white/10 focus:border-accent/50"
					/>
				</div>
			</div>

			{/* Users List */}
			<div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
				{isLoading && (
					<div className="flex items-center justify-center py-8">
						<Loader />
					</div>
				)}

				{error && <div className="text-center py-8 text-error text-sm">{error}</div>}

				{!isLoading && !error && searchQuery.length >= 3 && users.length === 0 && (
					<div className="text-center py-8 text-muted text-sm flex flex-col items-center gap-2">
						<Search size={24} className="opacity-20" />
						No users found
					</div>
				)}

				{!isLoading && !error && searchQuery.length < 3 && selectedUsers.length === 0 && (
					<div className="text-center py-12 text-muted text-sm opacity-50">Type name to search</div>
				)}

				{!isLoading &&
					!error &&
					users.map((user) => {
						const isSelected = selectedUsers.some((u) => u.id === user.id);

						return (
							<div
								key={user.id}
								onClick={() => toggleUser(user)}
								className={`
								flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all group
								${isSelected ? "bg-accent/10 border border-accent/30" : "hover:bg-white/5 border border-transparent"}
							`}>
								<div className="flex items-center gap-3">
									<UserAvatar profile={user} />
									<div className="flex flex-col">
										<span className={`text-sm font-medium transition-colors ${isSelected ? "text-white" : "text-gray-200"}`}>
											{user.name} {user.surname}
										</span>
										<span className="text-xs text-muted truncate max-w-[180px]">{user.email}</span>
									</div>
								</div>

								<div
									className={`
									w-5 h-5 rounded-full border flex items-center justify-center transition-all
									${isSelected ? "bg-accent border-accent scale-110" : "border-white/20 group-hover:border-white/40"}
								`}>
									{isSelected && <Check size={12} className="text-white" />}
								</div>
							</div>
						);
					})}
			</div>
		</div>
	);
};

export default UserSelector;
