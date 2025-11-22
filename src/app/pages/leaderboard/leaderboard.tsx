import { useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { useLeaderboardQuery } from '@/hooks/queries/use-leaderboard-query';
import Leaderboard from '@/components/leaderboard';
import Menu from '@/components/menu';

const LeaderboardPage = () => {
  const { user } = useUser();
  const { data: leaderboard, isLoading } = useLeaderboardQuery();

  const [showMenu, setShowMenu] = useState(false);

  if (isLoading || !user || !leaderboard) {
    return <div>Loading...</div>;
  }

  const handleMenuClicked = () => {
    setShowMenu(true);
  };

  return (
    <div className="w-full h-screen p-4 flex flex-col justify-center items-center gap-2 overflow-hidden">
      <div className="flex-1 overflow-hidden w-full max-w-xl">
        <Leaderboard list={leaderboard.list} currentUser={user} showHeader />
      </div>

      <button
        onClick={handleMenuClicked}
        className="w-full p-4 max-w-xl bg-white hover:bg-gray-200 text-black sprite sprite-shadows cursor-pointer rounded-xl"
      >
        Menu
      </button>

      {showMenu && <Menu />}
    </div>
  );
};

export default LeaderboardPage;
