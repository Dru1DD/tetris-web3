import { useNavigate } from 'react-router';
import { signInWithPopup, TwitterAuthProvider } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLoginButtonClicked = async () => {
    try {
      const twitterProvider = new TwitterAuthProvider();
      const result = await signInWithPopup(firebaseAuth, twitterProvider);

      const user = result.user;
      if (user) {
        navigate('/game');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="w-full min-h-screen flex flex-col justify-center items-center p-6">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-xl bg-linear-to-br from-indigo-500 to-violet-500 flex items-center justify-center sprite sprite-shadows">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">PolyCases</h1>
        </div>

        <span>Status {status}</span>
        <button
          onClick={handleLoginButtonClicked}
          className="bg-white hover:bg-gray-200 text-black w-36 h-16 sprite sprite-shadows cursor-pointer"
        >
          Twitter Login
        </button>

        <p className="absolute bottom-0 text-xs text-slate-400 mt-6">© {new Date().getFullYear()} PolyTetris</p>
      </div>
    </main>
  );
};

export default HomePage;
