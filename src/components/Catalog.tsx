import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { FEATURED_GAMES } from '../lib/FeaturedGames';

export const Catalog = () => {
  const { games, addGame, loadGames, removeGame, playGame } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadGames();
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
  }, []);

  

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) await addGame(files[0]);
  };

  const handlePlay = (id: string) => {
    playGame(id);
  };

  const handleDownloadFeatured = async (game: typeof FEATURED_GAMES[0]) => {
    try {
      setDownloadingId(game.id);
      const res = await fetch(game.romUrl);
      if (!res.ok) throw new Error('Failed to fetch ROM');
      const blob = await res.blob();
      const ext = game.system === 'sega' ? '.md' : '.nes';
      const file = new File([blob], `${game.title}${ext}`, { type: blob.type });
      await addGame(file);
    } catch (e) {
      alert('Ошибка при скачивании файла. Возможно блокировка CORS от Archive.org.');
      console.error(e);
    } finally {
      setDownloadingId(null);
    }
  };

  const renderGameCartridge = (title: string, system: string, imageUrl: string, onClick: () => void, btnText: string, onRemove?: () => void, isDownloading?: boolean) => (
    <div className="relative bg-gray-700 rounded-lg p-2 sm:p-3 pt-5 sm:pt-6 shadow-[0_10px_20px_rgba(0,0,0,0.6),inset_0_2px_5px_rgba(255,255,255,0.2)] border-b-[8px] sm:border-b-[12px] border-gray-900 flex flex-col gap-2 sm:gap-3 group transition-transform hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
      
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-600 text-white w-6 h-6 sm:w-8 sm:h-8 rounded-full font-bold flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border-2 border-gray-900 z-10 hover:bg-red-500 hover:scale-110"
          title="Удалить"
        >
          ×
        </button>
      )}
      
      <div className="absolute top-0 left-0 right-0 h-4 sm:h-6 flex justify-center gap-1 sm:gap-2 pt-1 sm:pt-2">
         {[1,2,3,4,5].map(i => (
           <div key={i} className="w-1.5 sm:w-2 h-3 sm:h-4 bg-gray-800 rounded-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]"></div>
         ))}
      </div>

      <div className="h-28 sm:h-48 bg-black flex items-center justify-center rounded border-2 sm:border-4 border-gray-800 overflow-hidden relative shadow-[inset_0_0_15px_rgba(0,0,0,1)] mt-2">
         <img 
           src={imageUrl}
           alt={title}
           className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
           onError={(e) => {
             (e.target as HTMLImageElement).style.display = 'none';
             (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
           }}
         />
         <span className="hidden absolute text-gray-500 font-bold text-2xl sm:text-4xl tracking-widest uppercase">{system}</span>
      </div>

      <div className="flex flex-col justify-between flex-1 bg-gray-800 p-2 sm:p-3 rounded shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] border border-gray-900 mt-1">
        <h3 className="font-bold text-xs sm:text-md text-yellow-500 truncate mb-2 sm:mb-3 drop-shadow-md text-center">{title}</h3>
        <button 
          onClick={onClick}
          disabled={isDownloading}
          className={`w-full bg-gradient-to-b from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border border-red-900 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded font-extrabold shadow-[0_4px_6px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.3)] active:translate-y-1 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] transition-all uppercase tracking-wider text-[10px] sm:text-sm ${isDownloading ? 'opacity-50 cursor-wait' : ''}`}
        >
          {isDownloading ? 'Скачивание...' : btnText}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-full p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-indigo-900/30 to-black relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-50 pointer-events-none mix-blend-overlay"></div>
      
      <div className="relative flex justify-between items-center mb-8 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold">Retro Player</h1>
        
        <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full cursor-pointer font-bold shadow-lg transition-transform hover:scale-105 inline-block text-sm sm:text-base">
          Добавить свою игру
          <input 
            type="file" 
            ref={fileInputRef} 
            accept=".nes,.md,.gen,.bin,.smd" 
            className="hidden" 
            onChange={handleFileUpload} 
          />
        </label>
      </div>

      {games.length > 0 && (
        <div className="relative max-w-7xl mx-auto mb-12">
          <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Моя Библиотека</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 p-2">
            {games.map(game => (
              <React.Fragment key={game.id}>
                {renderGameCartridge(
                  game.title,
                  game.system,
                  `https://tse1.mm.bing.net/th?q=${encodeURIComponent(game.system + ' game cover ' + game.title)}`,
                  () => handlePlay(game.id),
                  'Insert Coin',
                  (e?: any) => {
                    e?.stopPropagation();
                    if (window.confirm(`Удалить игру "${game.title}"?`)) {
                      removeGame(game.id);
                    }
                  }
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Каталог (Homebrew & Archive)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 p-2">
          {FEATURED_GAMES.map(game => (
            <React.Fragment key={game.id}>
              {renderGameCartridge(
                game.title,
                game.system,
                game.coverUrl,
                () => handleDownloadFeatured(game),
                'Скачать',
                undefined,
                downloadingId === game.id
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
    </div>
  );
};

