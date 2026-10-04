import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

export const Catalog = () => {
  const { games, loadGames, addGame, playGame } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadGames();
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) await addGame(files[0]);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">Retro Player</h1>
        
        <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full cursor-pointer font-bold shadow-lg transition-transform hover:scale-105 inline-block">
          Добавить игру
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".nes" 
            className="hidden" 
            onChange={handleFileUpload} 
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto">
        {games.map(game => (
          <div key={game.id} className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-blue-500 transition-colors p-4 flex flex-col gap-4">
            <div className="h-40 bg-gray-900 flex items-center justify-center rounded-lg border border-gray-700">
               <span className="text-gray-600 font-bold text-4xl">NES</span>
            </div>
            <div className="flex flex-col justify-between flex-1">
              <h3 className="font-bold text-lg truncate mb-4">{game.title}</h3>
              <button 
                onClick={() => playGame(game.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
              >
                Играть
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};