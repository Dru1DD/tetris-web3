import { Route, Routes } from 'react-router';
import PrivateRoute from './protected-route';
import HomePage from './pages/home';
import GamePage from './pages/game';
import LeaderboardPage from './pages/leaderboard';

export const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* <Route element={<PrivateRoute />}> */}
      <Route path="/game" element={<GamePage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      {/* </Route> */}
    </Routes>
  );
};
