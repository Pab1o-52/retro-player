const fs = require('fs');
const path = require('path');

const files = {
  'src/components/Player.tsx': `import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { NESEmulator } from '../lib/emulator/NESEmulator';
import { Gamepad } from './Gamepad';
import { Controller } from 'jsnes';

export const Player = () => {
  const { activeGameId, getRomBuffer, stopGame } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emulatorRef = useRef<NESEmulator | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (!activeGameId || !canvasRef.current) return;
    const emu = new NESEmulator(canvasRef.current);
    emulatorRef.current = emu;

    getRomBuffer(activeGameId).then(buffer => {
      if (buffer) {
        emu.loadROM(buffer);
        emu.start();
      }
    });

    return () => {
      emu.stop();
    };
  }, [activeGameId, getRomBuffer]);

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

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4 touch-none">
      
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

      {/* Масштабирование экрана (Canvas) */}
      <div className="w-full max-w-3xl mx-auto aspect-[256/240] flex justify-center items-center bg-gray-900 border-4 border-gray-700 rounded-lg overflow-hidden shadow-2xl mb-8">
        <canvas 
          ref={canvasRef} 
          width={256} 
          height={240} 
          className="w-full h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
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
};`,

  'src/components/Gamepad.tsx': `import React from 'react';
import { Controller } from 'jsnes';

interface GamepadProps {
  onButtonDown: (btn: number) => void;
  onButtonUp: (btn: number) => void;
}

export const Gamepad = ({ onButtonDown, onButtonUp }: GamepadProps) => {
  const triggerVibration = () => {
    if (navigator.vibrate) navigator.vibrate(15); 
  };

  const handleStart = (btn: number) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    triggerVibration();
    onButtonDown(btn);
  };

  const handleEnd = (btn: number) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onButtonUp(btn);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 flex justify-between items-center" style={{ touchAction: 'none' }}>
      
      {/* Крестовина (слева) */}
      <div className="relative w-32 h-32 bg-gray-800 rounded-full opacity-50">
        <button 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-600 rounded-t-md active:bg-gray-500"
          onPointerDown={handleStart(Controller.BUTTON_UP)} 
          onPointerUp={handleEnd(Controller.BUTTON_UP)} 
          onPointerLeave={handleEnd(Controller.BUTTON_UP)}
        />
        <button 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-600 rounded-b-md active:bg-gray-500"
          onPointerDown={handleStart(Controller.BUTTON_DOWN)} 
          onPointerUp={handleEnd(Controller.BUTTON_DOWN)} 
          onPointerLeave={handleEnd(Controller.BUTTON_DOWN)}
        />
        <button 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-600 rounded-l-md active:bg-gray-500"
          onPointerDown={handleStart(Controller.BUTTON_LEFT)} 
          onPointerUp={handleEnd(Controller.BUTTON_LEFT)} 
          onPointerLeave={handleEnd(Controller.BUTTON_LEFT)}
        />
        <button 
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-600 rounded-r-md active:bg-gray-500"
          onPointerDown={handleStart(Controller.BUTTON_RIGHT)} 
          onPointerUp={handleEnd(Controller.BUTTON_RIGHT)} 
          onPointerLeave={handleEnd(Controller.BUTTON_RIGHT)}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gray-600" />
      </div>

      {/* Кнопки A/B (справа) */}
      <div className="flex gap-6 items-end">
        <button 
          className="w-20 h-20 rounded-full bg-red-600 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 text-white font-bold text-2xl"
          onPointerDown={handleStart(Controller.BUTTON_B)} 
          onPointerUp={handleEnd(Controller.BUTTON_B)} 
          onPointerLeave={handleEnd(Controller.BUTTON_B)}
        >
          B
        </button>
        <button 
          className="w-20 h-20 rounded-full bg-red-600 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 text-white font-bold text-2xl mb-6"
          onPointerDown={handleStart(Controller.BUTTON_A)} 
          onPointerUp={handleEnd(Controller.BUTTON_A)} 
          onPointerLeave={handleEnd(Controller.BUTTON_A)}
        >
          A
        </button>
      </div>
    </div>
  );
};`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('Final UI components written.');
