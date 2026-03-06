"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers";
import { impersonateUser, refreshToken as refreshTokenApi } from "@/lib/api/auth";
import { searchUsers } from "@/lib/api/user";
import { UserProfile } from "@/lib/models/User";
import Avatar from "@/components/ui/avatar/index";
import { showErrorToast } from "@/lib/errors";
import { getCookie } from "@/lib/cookies";
import signalRManager from "@/lib/realtime/signalrClient";

const ADMIN_EMAIL = "denys.bielov@gmail.com";
const ADMIN_REFRESH_TOKEN_KEY = "dev_impersonation_admin_refresh_token";

function getEmailFromJwt(): string | null {
	const token = getCookie("token");
	if (!token) return null;
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		return payload.email ?? null;
	} catch {
		return null;
	}
}

export function DevImpersonator() {
	const { userProfile, loginFromTokens } = useAuth();
	const queryClient = useQueryClient();
	const [mounted, setMounted] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<UserProfile[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [isImpersonating, setIsImpersonating] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => setMounted(true), []);

	const isEnabled =
		mounted &&
		process.env.NEXT_PUBLIC_ENABLE_IMPERSONATION === "true" &&
		getEmailFromJwt() === ADMIN_EMAIL;

	const hasStoredOriginal =
		mounted && !!sessionStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);

	const isCurrentlyImpersonating =
		process.env.NEXT_PUBLIC_ENABLE_IMPERSONATION === "true" &&
		hasStoredOriginal;

	const clearUserState = useCallback(async () => {
		queryClient.removeQueries();
		await signalRManager.stopAll();
	}, [queryClient]);

	// Close panel on outside click
	useEffect(() => {
		if (!isOpen) return;
		const handleClick = (e: MouseEvent) => {
			if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [isOpen]);

	// Debounced search
	const handleSearch = useCallback((value: string) => {
		setQuery(value);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		if (!value.trim()) {
			setResults([]);
			return;
		}
		debounceRef.current = setTimeout(async () => {
			setIsSearching(true);
			try {
				const res = await searchUsers({ query: value, limit: 20 });
				setResults(res.items);
			} catch {
				setResults([]);
			} finally {
				setIsSearching(false);
			}
		}, 300);
	}, []);

	// Load initial user list when panel opens
	useEffect(() => {
		if (!isOpen || query.trim()) return;
		let cancelled = false;
		setIsSearching(true);
		searchUsers({ limit: 20 })
			.then((res) => {
				if (!cancelled) setResults(res.items);
			})
			.catch(() => {})
			.finally(() => {
				if (!cancelled) setIsSearching(false);
			});
		return () => {
			cancelled = true;
		};
	}, [isOpen, query]);

	const handleImpersonate = async (targetUser: UserProfile) => {
		if (targetUser.id === userProfile?.id) return;

		setIsImpersonating(true);
		try {
			if (!sessionStorage.getItem(ADMIN_REFRESH_TOKEN_KEY)) {
				sessionStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, getCookie("refreshToken") ?? "");
			}

			const authResponse = await impersonateUser(targetUser.id);
			await clearUserState();
			await loginFromTokens(authResponse);
			setIsOpen(false);
			setQuery("");
		} catch (error) {
			showErrorToast(error, { fallback: "Failed to impersonate user" });
		} finally {
			setIsImpersonating(false);
		}
	};

	const handleSwitchBack = async () => {
		const storedRefreshToken = sessionStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
		if (!storedRefreshToken) return;

		try {
			const authResponse = await refreshTokenApi(storedRefreshToken);
			await clearUserState();
			await loginFromTokens(authResponse);
			sessionStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
			setIsOpen(false);
			setQuery("");
		} catch (error) {
			showErrorToast(error, { fallback: "Failed to switch back" });
		}
	};

	if (!isEnabled && !isCurrentlyImpersonating) return null;

	return (
		<div ref={panelRef} className="fixed top-4 left-4 z-[9999]">
			{/* Toggle button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`flex items-center gap-2 rounded-full px-3 py-2 shadow-lg transition-all
					${isCurrentlyImpersonating
						? "bg-amber-500 text-white ring-2 ring-amber-300"
						: "bg-surface-raised text-foreground ring-1 ring-border"
					}
					hover:scale-105 active:scale-95`}
			>
				<Avatar
					src={userProfile?.imageUrl}
					name={userProfile ? `${userProfile.name} ${userProfile.surname}` : undefined}
					size="xs"
				/>
				<span className="text-xs font-medium max-w-[120px] truncate">
					{isCurrentlyImpersonating
						? `${userProfile?.name ?? "?"} ${userProfile?.surname ?? ""}`
						: "Impersonate"}
				</span>
			</button>

			{/* Dropdown panel */}
			{isOpen && (
				<div className="absolute top-14 left-0 w-80 rounded-xl bg-surface-raised shadow-xl ring-1 ring-border overflow-hidden">
					{/* Switch back button */}
					{isCurrentlyImpersonating && (
						<button
							onClick={handleSwitchBack}
							className="w-full px-4 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors flex items-center gap-2 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
							Back to {ADMIN_EMAIL}
						</button>
					)}

					{/* Search input */}
					<div className="p-3 border-b border-border">
						<input
							type="text"
							placeholder="Search by name or email..."
							value={query}
							onChange={(e) => handleSearch(e.target.value)}
							className="w-full px-3 py-2 text-sm rounded-lg bg-surface ring-1 ring-border focus:outline-none focus:ring-2 focus:ring-accent"
							autoFocus
						/>
					</div>

					{/* Results list */}
					<div className="max-h-72 overflow-y-auto">
						{isSearching && (
							<div className="px-4 py-3 text-sm text-muted-foreground text-center">
								Searching...
							</div>
						)}

						{!isSearching && results.length === 0 && query.trim() && (
							<div className="px-4 py-3 text-sm text-muted-foreground text-center">
								No users found
							</div>
						)}

						{results.map((user) => (
							<button
								key={user.id}
								onClick={() => handleImpersonate(user)}
								disabled={isImpersonating || user.id === userProfile?.id}
								className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-surface-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Avatar
									src={user.imageUrl}
									name={`${user.name} ${user.surname}`}
									size="sm"
								/>
								<div className="text-left min-w-0">
									<div className="text-sm font-medium truncate">
										{user.name} {user.surname}
									</div>
									<div className="text-xs text-muted-foreground truncate">
										{user.email}
									</div>
								</div>
								{user.id === userProfile?.id && (
									<span className="ml-auto text-xs text-muted-foreground">(you)</span>
								)}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
