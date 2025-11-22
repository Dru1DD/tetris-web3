// import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
// import { firebaseAuth } from '@/lib/firebase';
// import type { Leaderboard } from '@/types/leaderboard';
import { mockUserList } from '@/mocks/handlers';

export const LEADERBOARD_QUERY_KEY = 'leaderboard-query-key';

export const useLeaderboardQuery = () => {
  return useQuery({
    queryKey: [LEADERBOARD_QUERY_KEY],
    queryFn: async () => {
      // const token = await firebaseAuth.currentUser?.getIdToken();
      // const res = await axios.get<Leaderboard>(`${import.meta.env.VITE_DB_URL}/leaderboard`, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      return {
        list: mockUserList
      };
    },
  });
};
