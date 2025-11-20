import {
	Avatar,
	Checkbox,
	Loader,
	MultiSelectInput,
} from "@/components";
import { useDebounce } from "@/hooks/useDebounce";
import { UserProfile } from "@/lib/models/User";
import { searchUsers as searchUsersAPI } from "@/lib/requests/user";
import { useState } from "react";

type UserSelectorProps = {
	selectedUsers: UserProfile[];
	onSelectedUsersChange: (users: UserProfile[]) => void;
    excludedUserIds?: string[];
};

const UserSelector = ({ selectedUsers, onSelectedUsersChange, excludedUserIds = [] }: UserSelectorProps) => {
	const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchValue, setSearchValue] = useState("");

	const searchUsers = (term: string) => {
		setError(null);
		if (term.length < 3) {
			setSuggestedUsers([]);
			return;
		}
		setIsLoading(true);

		searchUsersAPI(term)
			.then((data) => {
                // Filter out excluded users
                const filteredData = data.filter(u => !excludedUserIds.includes(u.userId));
				setSuggestedUsers(filteredData);
				setIsLoading(false);
			})
			.catch((err) => {
				setError("Failed to search users. Try again later.");
				setIsLoading(false);
			});
	};

	const searchUsersDebounced = useDebounce(searchUsers, 300);

	const handleSearchChange = (term: string) => {
		setSearchValue(term);
		searchUsersDebounced(term);
	};

	const toggleUserSelection = (user: UserProfile) => {
		const isSelected = selectedUsers.some(
			(selected) => selected.userId === user.userId
		);

		if (isSelected) {
			onSelectedUsersChange(
				selectedUsers.filter(
					(selected) => selected.userId !== user.userId
				)
			);
		} else {
			onSelectedUsersChange([...selectedUsers, user]);
		}
	};

	return (
		<div className="flex flex-col gap-4 h-full">
			<MultiSelectInput<UserProfile>
				placeholder="Search by name..."
				selectedItems={selectedUsers}
				onSelectedItemsChange={onSelectedUsersChange}
				searchValue={searchValue}
				onSearchChange={handleSearchChange}
				getItemKey={(user) => user.userId}
				getItemLabel={(user) => `${user.name} ${user.surname}`}
				helperText="Type at least 3 characters to search"
			/>

			{/* Results List */}
			<div className="min-h-64 relative flex-1 overflow-y-auto">
				{isLoading && <Loader className="inset-0 absolute" />}
				{error && <div className="text-error">{error}</div>}
				{!isLoading &&
					!error &&
					suggestedUsers.length === 0 &&
					searchValue.length >= 3 && (
						<div className="text-muted">No users found</div>
					)}
				{!isLoading && !error && suggestedUsers.length > 0 && (
					<div className="w-full">
						{suggestedUsers.map((user) => {
							const isSelected = selectedUsers.some(
								(selected) => selected.userId === user.userId
							);

							return (
								<div
									key={user.userId}
									className="p-2 hover:bg-background-light cursor-pointer flex justify-between items-center rounded-md"
									onClick={() => toggleUserSelection(user)}>
									<div className="flex items-center gap-3">
										<Avatar profile={user} size="small" />
										<span className="font-bold">
											{user.name} {user.surname}
										</span>
									</div>
									<Checkbox
										checked={isSelected}
										color="neutral"
										readOnly
									/>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default UserSelector;
