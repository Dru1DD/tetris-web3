import { type ReactNode, useState, useEffect } from 'react';
import { UserContext, type User } from '@/context/user-context';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
      } else {
        // TODO: Send info to backend about user
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || '',
          photoUrl: firebaseUser.photoURL || '',
        });
      }
      setIsLoading(false);
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
