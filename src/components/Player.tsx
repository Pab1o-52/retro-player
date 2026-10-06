import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { Gamepad } from './Gamepad';
import { Nostalgist } from 'nostalgist';

export const Player = () => {
  const { games, activeGameId, getRomBuffer, stopGame, saveGameState, loadGameState, joystickScale, setJoystickScale, buttonLayout, setButtonLayout } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nostalgistRef = useRef<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [debugLog, setDebugLog] = useState<string>('');

  const activeGame = games.find(g => g.id === activeGameId);

  useEffect(() => {
    if (!activeGameId || !canvasRef.current || !activeGame) return;
    
    let isCancelled = false;
    setDebugLog('Loading Emulator Core (WASM)...');

    getRomBuffer(activeGameId).then(async (buffer) => {
      if (isCancelled || !buffer) return;
      
      try {
        const coreName = activeGame.system === 'sega' ? 'genesis_plus_gx' : 'fceumm';
        
        // Nostalgist automatically initializes WebGL context on the canvas
        const nostalgist = await Nostalgist.launch({
          core: coreName,
          rom: buffer,
          element: canvasRef.current!,
          // Мы можем отключить встроенное управление, если хотим использовать только свой Gamepad
          // но Nostalgist сам биндит стрелочки клавиатуры.
        });

        if (isCancelled) {
          nostalgist.exit();
          return;
        }

        nostalgistRef.current = nostalgist;
        setDebugLog('');
      } catch (err: any) {
        setDebugLog('Core Crash: ' + err.message);
      }
    });

    return () => {
      isCancelled = true;
      if (nostalgistRef.current) {
        nostalgistRef.current.exit();
        nostalgistRef.current = null;
      }
    };
  }, [activeGameId, activeGame]);

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const handleSave = async () => {
    if (nostalgistRef.current && activeGameId) {
      const state = await nostalgistRef.current.saveState();
      // Nostalgist saveState returns a Blob, which we can save to IndexedDB
      await saveGameState(activeGameId, state);
      setIsSettingsOpen(false);
      setDebugLog('Сохранено!');
      setTimeout(() => setDebugLog(''), 2000);
    }
  };

  const handleLoad = async () => {
    if (nostalgistRef.current && activeGameId) {
      const stateBlob = await loadGameState(activeGameId);
      if (stateBlob) {
        await nostalgistRef.current.loadState(stateBlob.state); // nostalgist api
        setIsSettingsOpen(false);
        setDebugLog('Загружено!');
        setTimeout(() => setDebugLog(''), 2000);
      } else {
        setDebugLog('Нет сохранений!');
        setTimeout(() => setDebugLog(''), 2000);
      }
    }
  };

  // Временная заглушка для Gamepad: Nostalgist использует RetroArch эмуляцию ввода.
  // Идеально было бы использовать nostalgist.pressDown('a'), но нужно маппить кнопки.
  const handleButtonDown = (btn: string) => {
    if (nostalgistRef.current) nostalgistRef.current.pressDown(btn);
  };
  const handleButtonUp = (btn: string) => {
    if (nostalgistRef.current) nostalgistRef.current.pressUp(btn);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between p-4 touch-none h-[100dvh]">
      
      <div className="w-full max-w-3xl mx-auto flex justify-between items-center mb-4 px-2">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow"
        >
          ⚙️ Настройки
        </button>
        <button 
          onClick={stopGame}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow"
        >
          Выйти
        </button>
      </div>

      <div className="relative w-full max-w-3xl mx-auto aspect-[256/240] bg-black border-4 md:border-[12px] border-gray-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,1)] mb-2 sm:mb-8 flex justify-center items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-10" />
        
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-contain relative z-0"
          style={{ imageRendering: 'pixelated' }}
        />

        {debugLog && (
          <div className="absolute top-4 left-4 z-30 p-2 bg-black/80 rounded border border-green-500/30 shadow-lg">
            <span className="text-green-500 font-mono text-sm font-bold uppercase tracking-widest drop-shadow-md">
              {debugLog}
            </span>
          </div>
        )}
      </div>

      {/* Пока что Gamepad.tsx использует коды jsnes, это сломается. 
          Надо переписать Gamepad.tsx на отправку строковых команд (up, down, a, b, start, select). */}
      <Gamepad 
        onButtonDown={handleButtonDown}
        onButtonUp={handleButtonUp}
        scale={joystickScale}
        layout={buttonLayout}
      />

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-white text-center mb-2">Настройки</h2>
            
            <div className="grid grid-cols-2 gap-4">
               <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-md">
                 💾 Сохранить
               </button>
               <button onClick={handleLoad} className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-md">
                 📂 Загрузить
               </button>
            </div>

            <div className="w-full h-px bg-gray-700 my-2"></div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium">Размер джойстика: {Math.round(joystickScale * 100)}%</label>
              <input 
                type="range" 
                min="0.5" max="2" step="0.1" 
                value={joystickScale} 
                onChange={(e) => setJoystickScale(parseFloat(e.target.value))}
                className="w-full accent-blue-500" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium">Количество кнопок</label>
              <select 
                value={buttonLayout}
                onChange={(e) => setButtonLayout(parseInt(e.target.value) as 2|3|4|6)}
                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none focus:border-blue-500"
              >
                <option value={2}>2 кнопки (A, B)</option>
                <option value={3}>3 кнопки (A, B, C)</option>
                <option value={4}>4 кнопки (A, B, X, Y)</option>
                <option value={6}>6 кнопок (A, B, C, X, Y, Z)</option>
              </select>
            </div>

            <div className="w-full h-px bg-gray-700 my-2"></div>

            <button 
              onClick={handleFullScreen}
              className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors"
            >
              🖥 Full Screen
            </button>

            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold transition-colors mt-2"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

