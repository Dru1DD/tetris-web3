import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/game");
  };

  return (
    <main className="w-full min-h-screen flex flex-col justify-center items-center p-6">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">PolyTetris</h1>
        </div>

        <div className="grid grid-cols-6 gap-1 opacity-70">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="w-4 h-4 bg-slate-300 rounded-sm" />
          ))}
        </div>

        <Button
          onClick={handleStart}
          className="mt-4 px-8 py-3 text-lg shadow-md hover:shadow-lg"
        >
          Start Game
        </Button>

        <p className="absolute bottom-0 text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} PolyTetris
        </p>
      </div>
    </main>
  );
};

export default HomePage;
