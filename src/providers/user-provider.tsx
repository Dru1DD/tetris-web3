import { type ReactNode, useState, useEffect } from 'react';
import { useUserMutation } from '@/hooks/mutations/use-user-mutation';
import { UserContext } from '@/context/user-context';
import { type User } from '@/types/user';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const { mutateAsync } = useUserMutation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);

    const unsub = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        localStorage.removeItem('app_user');
        setIsLoading(false);
        return;
      }

      const cached = localStorage.getItem('app_user');
      const parsed = cached ? JSON.parse(cached) : null;

      if (parsed && parsed.uid === firebaseUser.uid) {
        setUser(parsed);
        setIsLoading(false);
        return;
      }

      try {
        const mutationResult = await mutateAsync();

        const newUser = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || '',
          photoUrl: firebaseUser.photoURL || '',
          score: mutationResult.score,
          place: mutationResult.place,
          bestScore: mutationResult.bestScore,
        };

        setUser(newUser);
        localStorage.setItem('app_user', JSON.stringify(newUser));
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(firebaseAuth);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        handleLogout,
      }}
    >
      {!isLoading && children}
    </UserContext.Provider>
  );
};
