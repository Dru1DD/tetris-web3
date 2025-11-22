import type { User } from '@/types/user';
import { useMutation } from '@tanstack/react-query';
import { firebaseAuth } from '@/lib/firebase';
import axios from 'axios';

// TODO: replace with real data
export const USER_MUTATION_KEY = 'user-mutation-key';

export const useUserMutation = () => {
  return useMutation({
    mutationKey: [USER_MUTATION_KEY],
    mutationFn: async () => {
      const token = await firebaseAuth.currentUser?.getIdToken();

      const res = await axios.post<User>(
        `${import.meta.env.VITE_DB_URL}/user`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res.data;
    },
  });
};
