import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/requests/auth";
import { UserProfile } from "@/lib/models/User";

interface UseUserReturn {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const useUser = (): UseUserReturn => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const userData = await getCurrentUserProfile();
        setUserProfile(userData);
      } catch (err: any) {
        console.error("Error fetching user:", err);
        setError(err.message || "Failed to fetch user");

        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  return { userProfile: userProfile ?? null, loading, error };
};

export default useUser;
