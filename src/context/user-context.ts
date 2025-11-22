import type { User } from '@/types/user';
import { createContext } from 'react';

export interface TwitterUserContext {
  user: User | null;
  isLoading: boolean;
  handleLogout: () => void;
}

export const UserContext = createContext<TwitterUserContext | null>(null);
