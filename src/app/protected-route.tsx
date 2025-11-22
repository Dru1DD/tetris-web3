import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@/hooks/use-user';

export default function PrivateRoute() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
