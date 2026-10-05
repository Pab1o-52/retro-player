import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { resumeAudioContext } from '../lib/audioContext';

export const Catalog = () => {
  const { games, loadGames, addGame, playGame, removeGame } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadGames();
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) await addGame(files[0]);
  };

  const handlePlay = (id: string) => {
    resumeAudioContext();
    playGame(id);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold">Retro Player</h1>
        
        <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full cursor-pointer font-bold shadow-lg transition-transform hover:scale-105 inline-block text-sm sm:text-base">
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

      {games.length === 0 && (
        <div className="max-w-7xl mx-auto mb-8 bg-gray-800/80 border border-blue-500/30 rounded-xl p-4 sm:p-6 shadow-xl backdrop-blur-sm text-sm sm:text-base">
          <h2 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2">
            <span className="text-blue-400">ℹ️</span> Как начать играть?
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Эмулятор поддерживает игры для приставки Dendy / NES (формат <strong>.nes</strong>). 
            Вы можете найти их в интернете по запросам вроде <a href="https://www.google.com/search?q=NES+ROMs+download" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">«NES ROMs»</a> или <a href="https://www.google.com/search?q=игры+денди+скачать" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">«Игры Денди скачать»</a>. 
            <br/>
            <span className="text-xs sm:text-sm text-gray-500 mt-2 block">
              * Убедитесь, что скачиваемые файлы имеют расширение .nes. Скачивание некоторых игр может быть ограничено авторским правом.
            </span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 p-2 max-w-7xl mx-auto">
        {games.map(game => (
          <div key={game.id} className="relative bg-gray-700 rounded-lg p-2 sm:p-3 pt-5 sm:pt-6 shadow-[0_10px_20px_rgba(0,0,0,0.6),inset_0_2px_5px_rgba(255,255,255,0.2)] border-b-[8px] sm:border-b-[12px] border-gray-900 flex flex-col gap-2 sm:gap-3 group transition-transform hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
            
            {/* Кнопка удаления */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Удалить игру "${game.title}"?`)) {
                  removeGame(game.id);
                }
              }}
              className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full font-bold flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border-2 border-gray-900 z-10 hover:bg-red-500 hover:scale-110"
              title="Удалить игру"
            >
              ×
            </button>
            
            {/* Ребра картриджа сверху */}
            <div className="absolute top-0 left-0 right-0 h-4 sm:h-6 flex justify-center gap-1 sm:gap-2 pt-1 sm:pt-2">
               <div className="w-1.5 sm:w-2 h-3 sm:h-4 bg-gray-800 rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"></div>
               <div className="w-1.5 sm:w-2 h-3 sm:h-4 bg-gray-800 rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"></div>
               <div className="w-1.5 sm:w-2 h-3 sm:h-4 bg-gray-800 rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"></div>
               <div className="w-1.5 sm:w-2 h-3 sm:h-4 bg-gray-800 rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"></div>
               <div className="w-1.5 sm:w-2 h-3 sm:h-4 bg-gray-800 rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"></div>
            </div>

            {/* Картинка / Обложка игры */}
            <div className="h-28 sm:h-48 bg-black flex items-center justify-center rounded border-2 sm:border-4 border-gray-800 overflow-hidden relative shadow-[inset_0_0_15px_rgba(0,0,0,1)] mt-2">
               <img 
                 src={`https://tse1.mm.bing.net/th?q=${encodeURIComponent('NES game cover ' + game.title)}`}
                 alt={game.title}
                 className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                 onError={(e) => {
                   (e.target as HTMLImageElement).style.display = 'none';
                   (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                 }}
               />
               <span className="hidden absolute text-gray-500 font-bold text-2xl sm:text-4xl tracking-widest uppercase">NES</span>
            </div>

            {/* Блок с названием и кнопкой */}
            <div className="flex flex-col justify-between flex-1 bg-gray-800 p-2 sm:p-3 rounded shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-gray-900 mt-1">
              <h3 className="font-bold text-xs sm:text-md text-yellow-500 truncate mb-2 sm:mb-3 drop-shadow-md text-center">{game.title}</h3>
              <button 
                onClick={() => handlePlay(game.id)}
                className="w-full bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border border-red-900 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded font-extrabold shadow-[0_4px_6px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.3)] active:translate-y-1 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] transition-all uppercase tracking-wider text-[10px] sm:text-sm"
              >
                Insert Coin
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};