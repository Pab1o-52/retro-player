const fs = require('fs');
const path = require('path');

const files = {
  'src/App.tsx': `import { useStore } from './store/useStore';
import { Catalog } from './components/Catalog';
import { Player } from './components/Player';

function App() {
  const activeGameId = useStore(state => state.activeGameId);
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {activeGameId ? <Player /> : <Catalog />}
    </div>
  );
}

export default App;`,

  'src/components/Catalog.tsx': `import { useEffect, useRef } from 'react';
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
};`,

  'src/components/Player.tsx': `import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { NESEmulator } from '../lib/emulator/NESEmulator';
import { Gamepad } from './Gamepad';
import { Controller } from 'jsnes';

export const Player = () => {
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
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center touch-none">
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={stopGame}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold"
        >
          Выйти
        </button>
      </div>

      <canvas 
        ref={canvasRef} 
        width={256} 
        height={240} 
        className="shadow-[0_0_30px_rgba(0,0,0,0.8)] border-4 border-gray-800 rounded-lg max-w-full max-h-[70vh] object-contain"
        style={{ imageRendering: 'pixelated' }}
      />

      <div className="w-full max-w-2xl px-8 flex justify-between mt-8">
        <Gamepad 
          onButtonDown={(btn) => emulatorRef.current?.buttonDown(1, btn)} 
          onButtonUp={(btn) => emulatorRef.current?.buttonUp(1, btn)} 
        />
      </div>
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
    <>
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

      <div className="flex gap-4 items-end">
        <button 
          className="w-16 h-16 rounded-full bg-red-600 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 text-white font-bold text-xl"
          onPointerDown={handleStart(Controller.BUTTON_B)} 
          onPointerUp={handleEnd(Controller.BUTTON_B)} 
          onPointerLeave={handleEnd(Controller.BUTTON_B)}
        >
          B
        </button>
        <button 
          className="w-16 h-16 rounded-full bg-red-600 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 text-white font-bold text-xl mb-4"
          onPointerDown={handleStart(Controller.BUTTON_A)} 
          onPointerUp={handleEnd(Controller.BUTTON_A)} 
          onPointerLeave={handleEnd(Controller.BUTTON_A)}
        >
          A
        </button>
      </div>
    </>
  );
};`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('Strict UI applied.');
