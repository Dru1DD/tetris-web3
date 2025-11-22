import { createContext } from 'react';

export interface User {
  uid: string;
  displayName: string;
  photoUrl: string;
}

export interface TwitterUserContext {
  user: User | null;
  isLoading: boolean;
  handleLogout: () => void;
}

export const UserContext = createContext<TwitterUserContext | null>(null);
