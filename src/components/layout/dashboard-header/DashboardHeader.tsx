"use client";

import UserMenu from "./UserMenu";
import { useAuth } from "@/lib/auth/authContext";
import { usePathname } from "next/navigation";
import { getPageTitle } from "../shared/page-titles";

function DashboardHeader() {
	const { userProfile, isLoading } = useAuth();
	const pathname = usePathname();
	const pageTitle = getPageTitle(pathname);

	return (
		<header className="flex justify-between items-center w-full h-14 p-4 bg-background  rounded-md">
			<h1 className="text-2xl font-bold">{pageTitle}</h1>
			<UserMenu user={userProfile!} isLoading={isLoading} />
		</header>
	);
}

export default DashboardHeader;
