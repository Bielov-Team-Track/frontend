import React, { useState } from "react";
import Avatar from "@/components/ui/avatar";
import { User } from "@/lib/models/User";
import { search as searchUsers } from "@/lib/requests/user";

type UserSearchProps = {
  onUserSelect: (user: User) => void;
};

const UserSearch = ({ onUserSelect }: UserSearchProps) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setQuery(query);
    const results = await searchUsers(query);
    setSearchResults(results);
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Search by name or email..."
        value={query}
        onChange={handleSearch}
        className="input input-bordered w-full max-w-xs"
      />
      <div className="flex flex-col gap-4 max-h-[50vh] overflow-scroll">
        {searchResults.length > 0 &&
          searchResults.map((user) => (
            <div
              key={user.id}
              onClick={() => onUserSelect && onUserSelect(user)}
              className="flex gap-2"
            >
              <Avatar profile={user} />
              <span>{user.name}</span>
            </div>
          ))}
      </div>
    </div>
  );
};

export default UserSearch;
