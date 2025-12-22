"use client";

import Loader from "@/components/ui/loader";
import { useDebounce } from "@/hooks/useDebounce";
import { Group, GroupSearchResult } from "@/lib/models/Group";
import { searchGroups } from "@/lib/api/groups";
import React, { useEffect, useState } from "react";

function GroupSearchPage() {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState<GroupSearchResult[]>();
	const setQueryDebounced = useDebounce(setQuery, 500);

	const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value;
		setIsLoading(true);
		setQueryDebounced(query);
	};

	useEffect(() => {
		if (!query) {
			setIsLoading(false);
			setSearchResults(undefined);
			return;
		}

		searchGroups(query).then((results: GroupSearchResult[]) => {
			setIsLoading(false);
			setSearchResults(results);
		});
	}, [query]);

	const handleJoinGroup = (groupId: string) => {
		// Implement join group functionality
	};

	return (
		<div className="flex flex-col gap-4">
			<input
				type="text"
				placeholder="Search by group name..."
				onChange={handleSearch}
				className="input input-bordered w-full"
			/>
			<div className="flex flex-col gap-4 max-h-[50vh] overflow-scroll">
				{isLoading ? (
					<Loader />
				) : (
					searchResults &&
					(searchResults.length > 0 ? (
						searchResults.map((group) => (
							<div key={group.id} className="flex gap-2">
								<div className="flex items-center justify-between p-4 w-full rounded-md bg-primary/5">
									<span>{group.name}</span>
									<button
										className="btn btn-info btn-sm"
										onClick={() => handleJoinGroup(group.id)}
									>
										Join
									</button>
								</div>
							</div>
						))
					) : (
						<div className="text-center">No groups found</div>
					))
				)}
			</div>
		</div>
	);
}

export default GroupSearchPage;
