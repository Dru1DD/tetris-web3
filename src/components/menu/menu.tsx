import { useNavigate } from 'react-router';
import { useUser } from '@/hooks/use-user';
import { formatCompactNumber } from '@/utils/number';
import bagSrc from './assets/bag.png';
import BagIcon from './assets/bag.svg?react';

interface MenuProps {
  isGamePaused?: boolean;
  handleResetButtonClicked?: () => void;
  handleContinueGameClicked?: () => void;
}

const Menu = ({ isGamePaused, handleContinueGameClicked, handleResetButtonClicked }: MenuProps) => {
  const navigate = useNavigate();

  const { user, handleLogout } = useUser();

  const handleStartGameClicked = () => {
    navigate('/game');
  };
  const handleNavigateToLeaderboard = () => {
    navigate('/leaderboard');
  };

  const handleOnExitClicked = () => {
    handleLogout();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="absolute inset-0 bg-menu" />

      <div className="relative z-10 flex flex-col items-center gap-3 text-white">
        <div className="relative w-[300px] h-[245px]">
          <img src={bagSrc} alt="bag" className="absolute inset-0 w-full h-full object-cover -z-10" />

          <div className="mt-10 absolute inset-0 flex flex-col items-center justify-center gap-3 text-white px-4">
            <div className="w-full p-1 flex justify-center items-center rounded-xl bg-accent-dark-blue shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
              <span className="text-4xl">PolyCases</span>
            </div>
            <div className="flex w-full flex-row justify-center items-center gap-2">
              <img
                src={user?.photoUrl}
                alt="profileImg"
                className="w-16 h-16 rounded-xl border-2 border-black shadow-md"
              />

              <div className="w-full flex flex-col items-start">
                <span className="text-2xl flex items-center justify-center gap-1 font-semibold drop-shadow">
                  Score: {formatCompactNumber(user?.score || 0)}
                  <BagIcon className="w-6 h-6" />
                </span>

                <span className="text-xltruncate drop-shadow">
                  Best score:{' '}
                  <span className="text-accent-yellow font-bold">{formatCompactNumber(user?.score || 0)}</span>
                </span>
              </div>
            </div>

            <span className="text-2xl text-start w-full drop-shadow">
              You are in <span className="text-accent-yellow font-bold">{user?.place}th place</span>
            </span>
          </div>
        </div>

        {isGamePaused ? (
          <>
            <button
              onClick={handleContinueGameClicked}
              className="w-full p-4 bg-white hover:bg-gray-200 text-black  sprite sprite-shadows cursor-pointer"
            >
              Continue
            </button>
            <button
              onClick={handleResetButtonClicked}
              className="w-full p-4 bg-white hover:bg-gray-200 text-black  sprite sprite-shadows cursor-pointer"
            >
              Reset
            </button>
          </>
        ) : (
          <button
            onClick={handleStartGameClicked}
            className="w-full p-4 bg-white hover:bg-gray-200 text-black  sprite sprite-shadows cursor-pointer"
          >
            Start
          </button>
        )}
        <button
          onClick={handleNavigateToLeaderboard}
          className="w-full p-4 bg-white hover:bg-gray-200 text-black  sprite sprite-shadows cursor-pointer"
        >
          Leaderboard
        </button>
        <button
          onClick={handleOnExitClicked}
          className="w-full p-4 bg-white hover:bg-gray-200 text-black  sprite sprite-shadows cursor-pointer"
        >
          Exit
        </button>
      </div>
    </div>
  );
};

export default Menu;
