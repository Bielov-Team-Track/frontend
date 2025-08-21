import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserProfile } from "@/lib/requests/auth";

interface User {
  id: string;
  email: string;
  name?: string;
  // Add other user properties as needed
}

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const useUser = (): UseUserReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const userData = await getCurrentUserProfile();
        setUser(userData);
      } catch (err: any) {
        console.error('Error fetching user:', err);
        setError(err.message || 'Failed to fetch user');
        
        // If authentication failed, redirect to login
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/login');
        }
        
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  return { user, loading, error };
};

export default useUser;