const fs = require('fs');
const path = require('path');

const files = {
  'src/components/Player.tsx': `import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { NESEmulator } from '../lib/emulator/NESEmulator';
import { Gamepad } from './Gamepad';
import { Controller } from 'jsnes';
import { X } from 'lucide-react';

export const Player: React.FC = () => {
  const { activeGameId, getRomBuffer, stopGame } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emulatorRef = useRef<NESEmulator | null>(null);

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

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-between py-6 px-4 touch-none">
      <div className="w-full max-w-4xl flex justify-end">
        <button 
          onClick={stopGame}
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-full p-3 shadow-lg transition-colors z-20 border border-gray-700"
          title="Выйти в меню"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 w-full flex items-center justify-center min-h-[40vh]">
         <div className="relative rounded-lg overflow-hidden border-4 border-gray-800 shadow-[0_0_30px_rgba(0,0,0,0.8)] bg-black">
           <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-20"></div>
           <canvas 
             ref={canvasRef} 
             width={256} 
             height={240} 
             className="block max-w-full h-auto object-contain"
             style={{ imageRendering: 'pixelated', width: '100%', maxHeight: '60vh', minWidth: '320px' }}
           />
         </div>
      </div>

      <div className="w-full max-w-4xl pb-4 flex justify-center">
        <Gamepad 
          onButtonDown={(btn) => emulatorRef.current?.buttonDown(1, btn)} 
          onButtonUp={(btn) => emulatorRef.current?.buttonUp(1, btn)} 
        />
      </div>
    </div>
  );
};`,

  'src/components/Gamepad.tsx': `import React, { useCallback } from 'react';
import { Controller } from 'jsnes';

interface GamepadProps {
  onButtonDown: (btn: number) => void;
  onButtonUp: (btn: number) => void;
}

export const Gamepad: React.FC<GamepadProps> = ({ onButtonDown, onButtonUp }) => {
  const triggerVibration = () => {
    if (navigator.vibrate) navigator.vibrate(15); 
  };

  const handleStart = useCallback((btn: number) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    triggerVibration();
    onButtonDown(btn);
  }, [onButtonDown]);

  const handleEnd = useCallback((btn: number) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onButtonUp(btn);
  }, [onButtonUp]);

  return (
    <div className="flex justify-between items-end px-2 md:px-12 select-none w-full" style={{ touchAction: 'none' }}>
      
      {/* Крестовина (D-Pad) */}
      <div className="relative w-36 h-36 md:w-44 md:h-44 bg-gray-800/80 rounded-full shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center p-2 backdrop-blur-sm border border-gray-700/50">
        <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full relative z-10">
          <div />
          <button 
             className="bg-gray-700 rounded-t-lg active:bg-gray-600 transition-colors shadow-sm" 
             onPointerDown={handleStart(Controller.BUTTON_UP)} 
             onPointerUp={handleEnd(Controller.BUTTON_UP)} 
             onPointerLeave={handleEnd(Controller.BUTTON_UP)} 
          />
          <div />
          
          <button 
             className="bg-gray-700 rounded-l-lg active:bg-gray-600 transition-colors shadow-sm" 
             onPointerDown={handleStart(Controller.BUTTON_LEFT)} 
             onPointerUp={handleEnd(Controller.BUTTON_LEFT)} 
             onPointerLeave={handleEnd(Controller.BUTTON_LEFT)} 
          />
          <div className="bg-gray-800 rounded-sm shadow-inner" />
          <button 
             className="bg-gray-700 rounded-r-lg active:bg-gray-600 transition-colors shadow-sm" 
             onPointerDown={handleStart(Controller.BUTTON_RIGHT)} 
             onPointerUp={handleEnd(Controller.BUTTON_RIGHT)} 
             onPointerLeave={handleEnd(Controller.BUTTON_RIGHT)} 
          />
          
          <div />
          <button 
             className="bg-gray-700 rounded-b-lg active:bg-gray-600 transition-colors shadow-sm" 
             onPointerDown={handleStart(Controller.BUTTON_DOWN)} 
             onPointerUp={handleEnd(Controller.BUTTON_DOWN)} 
             onPointerLeave={handleEnd(Controller.BUTTON_DOWN)} 
          />
          <div />
        </div>
      </div>

      {/* Центральные кнопки (Select / Start) */}
      <div className="flex flex-col items-center gap-4 mb-4 hidden sm:flex">
         <div className="flex gap-4">
            <button 
              className="w-12 h-4 bg-gray-700 rounded-full shadow-md active:bg-gray-600 active:translate-y-0.5 transition-all rotate-[15deg]"
              onPointerDown={handleStart(Controller.BUTTON_SELECT)} 
              onPointerUp={handleEnd(Controller.BUTTON_SELECT)} 
              onPointerLeave={handleEnd(Controller.BUTTON_SELECT)}
            />
            <button 
              className="w-12 h-4 bg-gray-700 rounded-full shadow-md active:bg-gray-600 active:translate-y-0.5 transition-all rotate-[15deg]"
              onPointerDown={handleStart(Controller.BUTTON_START)} 
              onPointerUp={handleEnd(Controller.BUTTON_START)} 
              onPointerLeave={handleEnd(Controller.BUTTON_START)}
            />
         </div>
         <div className="flex gap-4 opacity-50">
            <span className="text-xs text-gray-400 font-bold tracking-widest">SELECT</span>
            <span className="text-xs text-gray-400 font-bold tracking-widest">START</span>
         </div>
      </div>

      {/* Action Buttons (A / B) */}
      <div className="flex gap-4 md:gap-6 mb-6">
        <button 
           className="w-16 h-16 md:w-20 md:h-20 bg-red-600/90 rounded-full shadow-[0_4px_15px_rgba(220,38,38,0.5)] active:bg-red-500 active:translate-y-1 active:shadow-[0_2px_5px_rgba(220,38,38,0.5)] transition-all text-white font-bold text-2xl backdrop-blur-sm border border-red-500/50 flex items-center justify-center"
           onPointerDown={handleStart(Controller.BUTTON_B)} 
           onPointerUp={handleEnd(Controller.BUTTON_B)} 
           onPointerLeave={handleEnd(Controller.BUTTON_B)}
        >
          B
        </button>
        <button 
           className="w-16 h-16 md:w-20 md:h-20 bg-red-600/90 rounded-full shadow-[0_4px_15px_rgba(220,38,38,0.5)] active:bg-red-500 active:translate-y-1 active:shadow-[0_2px_5px_rgba(220,38,38,0.5)] transition-all text-white font-bold text-2xl backdrop-blur-sm border border-red-500/50 flex items-center justify-center mt-[-30px]"
           onPointerDown={handleStart(Controller.BUTTON_A)} 
           onPointerUp={handleEnd(Controller.BUTTON_A)} 
           onPointerLeave={handleEnd(Controller.BUTTON_A)}
        >
          A
        </button>
      </div>
    </div>
  );
};`,

  'src/components/Catalog.tsx': `import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Play, Upload, Gamepad2 } from 'lucide-react';

export const Catalog: React.FC = () => {
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
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-3 rounded-xl shadow-lg shadow-red-600/20">
              <Gamepad2 size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Retro Player</h1>
              <p className="text-gray-400 font-medium mt-1">Local-First NES Emulator</p>
            </div>
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-full flex items-center gap-3 transition-all hover:shadow-xl border border-gray-700"
          >
            <Upload size={20} className="text-red-500" />
            <span className="font-semibold">Добавить игру (.nes)</span>
          </button>
          <input type="file" ref={fileInputRef} accept=".nes" className="hidden" onChange={handleFileUpload} />
        </header>

        <main className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map(game => (
            <div key={game.id} className="group bg-gray-900 rounded-2xl shadow-lg hover:shadow-red-600/10 hover:border-red-500/30 transition-all overflow-hidden border border-gray-800 flex flex-col">
              <div className="h-48 bg-gray-800/50 flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-gray-800 transition-colors">
                 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-gray-900 to-black"></div>
                 <Gamepad2 size={48} className="text-gray-700 group-hover:text-red-500 transition-colors z-10 drop-shadow-lg" />
                 <span className="text-gray-600 font-bold text-2xl mt-4 z-10 tracking-widest uppercase">NES</span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-lg text-gray-200 truncate mb-4" title={game.title}>{game.title}</h3>
                <button 
                  onClick={() => playGame(game.id)}
                  className="w-full bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"
                >
                  <Play size={18} fill="currentColor" />
                  Играть
                </button>
              </div>
            </div>
          ))}
          
          {games.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-900/50 rounded-3xl border border-dashed border-gray-800">
              <Gamepad2 size={64} className="text-gray-700 mb-6" />
              <h2 className="text-2xl font-bold text-gray-400 mb-2">Библиотека пуста</h2>
              <p className="text-gray-500 text-center max-w-md">
                Нажмите «Добавить игру», чтобы загрузить ROM файл.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('UI updated successfully.');
