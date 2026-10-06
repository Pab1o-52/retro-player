import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { Catalog } from './components/Catalog';
import { Player } from './components/Player';
import { netplayManager } from './lib/multiplayer/NetplayManager';

function App() {
  const activeGameId = useStore(state => state.activeGameId);
  const setNetplayGame = useStore(state => state.setNetplayGame);
  const setNetplayStatus = useStore(state => state.setNetplayStatus);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinId = params.get('join');
    if (joinId) {
      setIsJoining(true);
      // clear URL so it doesn't try again on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
      
      netplayManager.onConnectionStatus = setNetplayStatus;
      netplayManager.onRomReceived = (title, system, buffer) => {
        setNetplayGame(title, system, buffer);
        setIsJoining(false);
      };

      netplayManager.joinGame(joinId).catch(err => {
        alert('Failed to connect to host: ' + err.message);
        setIsJoining(false);
      });
    }
  }, []);

  if (isJoining) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold mb-2">Подключение к другу...</h2>
        <p className="text-gray-400">Устанавливаем P2P соединение и скачиваем игру</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {activeGameId ? <Player /> : <Catalog />}
    </div>
  );
}

export default App;