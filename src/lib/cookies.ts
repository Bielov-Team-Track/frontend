export const getCookie = (name: string): string | null => {
	if (typeof window === "undefined") return null;
	const row = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
	if (!row) return null;
	// Use slice(1).join("=") to handle values containing "=" characters (like JWT tokens)
	return row.split("=").slice(1).join("=") || null;
};

export const setCookie = (name: string, value: string, maxAge: number): void => {
	if (typeof window === "undefined") return;
	const isSecure = window.location.protocol === "https:";
	const secureFlag = isSecure ? "; Secure" : "";
	document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
};

export const deleteCookie = (name: string): void => {
	if (typeof window === "undefined") return;
	const isSecure = window.location.protocol === "https:";
	const secureFlag = isSecure ? "; Secure" : "";
	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax${secureFlag}`;
};
