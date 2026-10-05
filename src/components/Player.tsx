import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { NESEmulator } from '../lib/emulator/NESEmulator';
import { Gamepad } from './Gamepad';
import { Controller } from 'jsnes';

export const Player = () => {
  const { activeGameId, getRomBuffer, stopGame } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emulatorRef = useRef<NESEmulator | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [debugLog, setDebugLog] = useState<string>('Loading...');

  useEffect(() => {
    if (!activeGameId || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false }); // Отключаем альфа-канал для скорости
    if (ctx) ctx.clearRect(0, 0, 256, 240);

    // Жестко останавливаем старый эмулятор при ререндере
    if (emulatorRef.current) {
      emulatorRef.current.stop();
    }

    const emu = new NESEmulator(canvas);
    emulatorRef.current = emu;

    setDebugLog('Fetching ROM from DB...');

    getRomBuffer(activeGameId)
      .then(buffer => {
        if (!buffer) {
          setDebugLog(prev => prev + '\nError: Empty buffer');
          return;
        }
        setDebugLog(prev => prev + '\nBuffer fetched. Native parsing...');

        // Используем нативный парсер браузера, чтобы не вешать Main Thread
        const blob = new Blob([buffer]);
        const reader = new FileReader();

        reader.onload = function(event) {
          try {
            const binaryString = event.target?.result as string;
            setDebugLog(prev => prev + '\nParsed. Loading JSnes...');
            emu.loadROM(binaryString);
            
            setDebugLog(prev => prev + '\nStarting Emulator...');
            emu.start();
            
            // Скрываем логгер при успешном старте
            setTimeout(() => setDebugLog(''), 500);
          } catch (err: any) {
            setDebugLog(prev => prev + '\njsnes Error: ' + err.message);
          }
        };

        reader.onerror = function() {
          setDebugLog(prev => prev + '\nFileReader Error');
        };

        reader.readAsBinaryString(blob);
      })
      .catch((err: any) => {
        setDebugLog(prev => prev + '\nDB Error: ' + err.message);
      });

    return () => {
      emu.stop();
      emulatorRef.current = null;
    };
  }, [activeGameId]); // Убрали getRomBuffer из зависимостей

  useEffect(() => {
    const keyMap: Record<string, number> = {
      'ArrowUp': Controller.BUTTON_UP,
      'ArrowDown': Controller.BUTTON_DOWN,
      'ArrowLeft': Controller.BUTTON_LEFT,
      'ArrowRight': Controller.BUTTON_RIGHT,
      'x': Controller.BUTTON_A,
      'z': Controller.BUTTON_B,
      'Enter': Controller.BUTTON_START,
      'Shift': Controller.BUTTON_SELECT,
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (keyMap[e.key] !== undefined) emulatorRef.current?.buttonDown(1, keyMap[e.key]);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (keyMap[e.key] !== undefined) emulatorRef.current?.buttonUp(1, keyMap[e.key]);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const handleInteraction = () => {
    if (emulatorRef.current) {
      emulatorRef.current.resumeAudio();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex flex-col justify-between p-4 touch-none h-[100dvh]"
      onTouchStart={handleInteraction}
      onClick={handleInteraction}
    >
      
      {/* Меню и Настройки (Top Bar) */}
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

      {/* Масштабирование экрана (Canvas) - Retro TV Style */}
      <div className="relative w-full max-w-3xl mx-auto aspect-[256/240] bg-black border-[12px] md:border-[20px] border-gray-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,1)] mb-8 flex justify-center items-center">
        {/* Блик экрана */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-10" />
        
        {/* Эффект Scanlines */}
        <div 
          className="absolute inset-0 pointer-events-none z-20 opacity-50" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)', 
            backgroundSize: '100% 4px' 
          }} 
        />

        <canvas 
          ref={canvasRef} 
          width={256} 
          height={240} 
          className="w-full h-full object-contain relative z-0"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* On-Screen Logger */}
        {debugLog && (
          <div className="absolute inset-0 z-30 p-4 bg-black/80 flex items-start justify-start overflow-auto">
            <pre className="text-green-500 font-mono text-xs whitespace-pre-wrap">
              {debugLog}
            </pre>
          </div>
        )}
      </div>

      {/* Наэкранный геймпад */}
      <Gamepad 
        onButtonDown={(btn) => emulatorRef.current?.buttonDown(1, btn)} 
        onButtonUp={(btn) => emulatorRef.current?.buttonUp(1, btn)} 
      />

      {/* Модальное окно настроек */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-sm flex flex-col gap-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white text-center">Настройки</h2>
            
            <div className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium">Громкость</label>
              <input type="range" min="0" max="100" defaultValue="50" className="w-full accent-blue-500" />
            </div>

            <button 
              onClick={handleFullScreen}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors"
            >
              Full Screen
            </button>

            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold transition-colors mt-2"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
