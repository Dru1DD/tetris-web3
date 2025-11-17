import { Route, Routes } from "react-router";
import HomePage from "./pages/home";
import GamePage from "./pages/game";

export const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/game" element={<GamePage />} />
    </Routes>
  );
};
