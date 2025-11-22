import { cn } from '@/lib/utils';
import type { User } from '@/types/user';

interface LeaderboardProps {
  list: User[];
  currentUser: User;
  showHeader?: boolean;
}

const Leaderboard = ({ list, currentUser, showHeader }: LeaderboardProps) => {
  return (
    <div className="w-full h-full rounded-xl bg-white/50 flex flex-col p-3 overflow-hidden">
      {showHeader && (
        <>
          <div className="w-full p-2 flex justify-center items-center rounded-xl bg-accent-dark-blue shadow-inner">
            <span className="text-2xl sm:text-3xl md:text-4xl">PolyCases</span>
          </div>

          <span className="text-center text-xl sm:text-2xl md:text-3xl mt-1">Leaders</span>
        </>
      )}

      <div className="flex-1 overflow-y-auto mt-2 pr-1">
        {list.map((user) => (
          <LeaderboardItem key={user.uid} user={user} />
        ))}
      </div>

      <div className="w-full border-t mt-2 pt-2">
        <LeaderboardItem user={currentUser} isCurrent />
      </div>
    </div>
  );
};

const LeaderboardItem = ({ user, isCurrent }: { user: User; isCurrent?: boolean }) => {
  return (
    <div className={cn('w-full flex flex-row gap-2 p-2 justify-between items-center', !isCurrent && 'my-2')}>
      <img src={user?.photoUrl} alt="profileImg" className="w-16 h-16 rounded-xl border-2 border-black shadow-md" />
      <div className="flex flex-col items-start flex-1">
        <span className={cn('text-xl max-w-40 truncate', isCurrent && 'text-accent-yellow')}>
          @{user.displayName} {isCurrent && '(you)'}
        </span>
        <span className="text-xl text-accent-dark-blue">Score {user.score}</span>
      </div>
      <PlaceTag place={user.place} />
    </div>
  );
};

const tagColors: Record<number, string> = {
  1: 'bg-accent-yellow',
  2: 'bg-accent-grey',
  3: 'bg-accent-brown',
};
const PlaceTag = ({ place }: { place: number }) => {
  const color = tagColors[place] ?? 'bg-accent-dark-blue';
  return <div className={cn('rounded-xl p-2', color)}>{place}th</div>;
};

export default Leaderboard;
