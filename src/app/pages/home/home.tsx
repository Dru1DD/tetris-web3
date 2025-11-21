import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

const BACKEND_URL = 'http://localhost:3010';

const HomePage = () => {
  const navigate = useNavigate();

  // TODO: update twitter auth flow
  const [status, setStatus] = useState('Not authenticated');
  async function checkToken() {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/twitter/token`, {
        credentials: 'include',
      });
      const data = await res.json();

      console.log('Data', data);
      if (data) {
        console.log(data);
        setStatus('Authenticated');
      } else {
        setStatus('Not authenticated');
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== BACKEND_URL) return;
      if (event.data.success) {
        checkToken();
        setStatus('Authenticated');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  function handleLoginButtonClicked() {
    setStatus('Opening Twitter OAuth...');

    const width = 600;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const popup = window.open(
      `${BACKEND_URL}/auth/twitter`,
      'twitterLogin',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`,
    );

    if (!popup) {
      setStatus('Popup blocked by browser. Allow popups!');
    }
  }

  const handleStart = () => {
    navigate('/game');
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

        <button
          onClick={handleStart}
          className="bg-white hover:bg-gray-200 text-black w-36 h-16 sprite sprite-shadows cursor-pointer"
        >
          Start Game
        </button>

        <p className="absolute bottom-0 text-xs text-slate-400 mt-6">© {new Date().getFullYear()} PolyTetris</p>
      </div>
    </main>
  );
};

export default HomePage;
