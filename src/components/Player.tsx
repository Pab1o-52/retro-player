import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { NESEmulator } from '../lib/emulator/NESEmulator';
import { Gamepad } from './Gamepad';
import { Controller } from 'jsnes';

export const Player = () => {
  const { activeGameId, getRomBuffer, stopGame, saveGameState, loadGameState } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emulatorRef = useRef<NESEmulator | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [debugLog, setDebugLog] = useState<string>('');

  useEffect(() => {
    if (!activeGameId || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (ctx) ctx.clearRect(0, 0, 256, 240);

    if (emulatorRef.current) {
      emulatorRef.current.stop();
    }

    const emu = new NESEmulator(canvas);
    emu.onError = (msg) => setDebugLog(prev => prev + '\n' + msg);
    emulatorRef.current = emu;

    getRomBuffer(activeGameId).then(buffer => {
      setTimeout(() => {
        try {
          if (buffer) {
            emu.loadROM(buffer);
            emu.start();
          }
        } catch (err: any) {
          setDebugLog('Crash: ' + err.message);
        }
      }, 50);
    });

    return () => {
      emu.stop();
      emulatorRef.current = null;
    };
  }, [activeGameId]);

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

  const handleSave = async () => {
    if (emulatorRef.current && activeGameId) {
      const state = emulatorRef.current.saveState();
      await saveGameState(activeGameId, state);
      setIsSettingsOpen(false);
      setDebugLog('Сохранено!');
      setTimeout(() => setDebugLog(''), 2000);
    }
  };

  const handleLoad = async () => {
    if (emulatorRef.current && activeGameId) {
      const state = await loadGameState(activeGameId);
      if (state) {
        emulatorRef.current.loadState(state);
        setIsSettingsOpen(false);
        setDebugLog('Загружено!');
        setTimeout(() => setDebugLog(''), 2000);
      } else {
        setDebugLog('Нет сохранений!');
        setTimeout(() => setDebugLog(''), 2000);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex flex-col justify-between p-4 touch-none h-[100dvh]"
      onTouchStart={handleInteraction}
      onClick={handleInteraction}
    >
      
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


        <canvas 
          ref={canvasRef} 
          width={256} 
          height={240} 
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

      <Gamepad 
        onButtonDown={(btn) => emulatorRef.current?.buttonDown(1, btn)} 
        onButtonUp={(btn) => emulatorRef.current?.buttonUp(1, btn)} 
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

