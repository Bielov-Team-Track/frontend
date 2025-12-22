import { UserProfile } from "@/lib/models/User";
import { useAuth } from "@/providers";

interface UseUserReturn {
	userProfile: UserProfile | null;
	loading: boolean;
	error: string | null;
}

/**
 * Hook to get the current user profile from AuthContext.
 * This hook reads from the centralized auth state to avoid duplicate profile fetches.
 */
const useUser = (): UseUserReturn => {
	const { userProfile, isLoading } = useAuth();

	return {
		userProfile,
		loading: isLoading,
		error: null,
	};
};

export default useUser;
