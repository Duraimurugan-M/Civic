import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../services/api';
import useAuthStore from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  return { user, isAuthenticated, setUser, logout };
};

export const useCurrentUser = () => {
  const { setUser } = useAuthStore();
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await authAPI.getMe();
      setUser(res.data.user);
      return res.data.user;
    },
    retry: false,
  });
};
