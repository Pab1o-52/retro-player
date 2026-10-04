const fs = require('fs');
const path = require('path');

const files = {
  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,

  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #f3f4f6;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}`,

  'src/types/jsnes.d.ts': `declare module 'jsnes' {
  export class NES {
    constructor(options: any);
    loadROM(data: string): void;
    frame(): void;
    buttonDown(player: number, button: number): void;
    buttonUp(player: number, button: number): void;
  }
  export const Controller: {
    BUTTON_A: number;
    BUTTON_B: number;
    BUTTON_SELECT: number;
    BUTTON_START: number;
    BUTTON_UP: number;
    BUTTON_DOWN: number;
    BUTTON_LEFT: number;
    BUTTON_RIGHT: number;
  };
}`,

  'src/lib/emulator/RingBuffer.ts': `export class RingBuffer {
  private buffer: Float32Array;
  private head: number = 0;
  private tail: number = 0;
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Float32Array(capacity);
  }

  public enq(value: number): void {
    this.buffer[this.tail] = value;
    this.tail = (this.tail + 1) % this.capacity;
    if (this.tail === this.head) {
      this.head = (this.head + 1) % this.capacity;
    }
  }

  public deq(): number {
    if (this.isEmpty()) return 0;
    const value = this.buffer[this.head];
    this.head = (this.head + 1) % this.capacity;
    return value;
  }

  public isEmpty(): boolean {
    return this.head === this.tail;
  }
}`,

  'src/lib/emulator/NESEmulator.ts': `import { NES } from 'jsnes';
import { RingBuffer } from './RingBuffer';

export class NESEmulator {
  private nes: NES;
  private canvasCtx: CanvasRenderingContext2D;
  private audioCtx: AudioContext;
  private scriptProcessor: ScriptProcessorNode;
  private ringBuffer: RingBuffer;
  private animationFrameId: number = 0;
  private isRunning: boolean = false;
  private fpsInterval = 1000 / 60;
  private then = performance.now();

  constructor(canvas: HTMLCanvasElement) {
    this.canvasCtx = canvas.getContext('2d', { alpha: false })!;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    this.ringBuffer = new RingBuffer(8192);
    
    this.scriptProcessor = this.audioCtx.createScriptProcessor(4096, 0, 1);
    this.scriptProcessor.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < output.length; i++) {
        output[i] = this.ringBuffer.deq() || 0;
      }
    };
    this.scriptProcessor.connect(this.audioCtx.destination);

    this.nes = new NES({
      onFrame: this.onFrame,
      onAudioSample: (left: number, right: number) => {
        this.ringBuffer.enq(left);
      },
      sampleRate: 44100,
    });
  }

  private onFrame = (frameBuffer: number[]) => {
    const imageData = this.canvasCtx.createImageData(256, 240);
    for (let i = 0; i < 256 * 240; i++) {
        const pixel = frameBuffer[i];
        const offset = i * 4;
        imageData.data[offset] = pixel & 0xFF;         
        imageData.data[offset + 1] = (pixel >> 8) & 0xFF;  
        imageData.data[offset + 2] = (pixel >> 16) & 0xFF; 
        imageData.data[offset + 3] = 255;                  
    }
    this.canvasCtx.putImageData(imageData, 0, 0);
  };

  public async loadROM(romBuffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(romBuffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    this.nes.loadROM(binary);
  }

  public start() {
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.isRunning = true;
    this.then = performance.now();
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
    if (this.audioCtx.state !== 'suspended') {
      this.audioCtx.suspend();
    }
  }

  private loop = () => {
    if (!this.isRunning) return;
    this.animationFrameId = requestAnimationFrame(this.loop);
    const now = performance.now();
    const elapsed = now - this.then;
    if (elapsed > this.fpsInterval) {
      this.then = now - (elapsed % this.fpsInterval);
      this.nes.frame();
    }
  };

  public buttonDown(player: number, button: number) { this.nes.buttonDown(player, button); }
  public buttonUp(player: number, button: number) { this.nes.buttonUp(player, button); }
}`,

  'src/store/useStore.ts': `import { create } from 'zustand';
import localforage from 'localforage';

localforage.config({
  name: 'RetroPlayer',
  storeName: 'roms_and_saves'
});

export interface Game {
  id: string;
  title: string;
  addedAt: number;
}

interface EmulatorState {
  games: Game[];
  activeGameId: string | null;
  loadGames: () => Promise<void>;
  addGame: (file: File) => Promise<void>;
  playGame: (id: string) => void;
  stopGame: () => void;
  getRomBuffer: (id: string) => Promise<ArrayBuffer | null>;
}

export const useStore = create<EmulatorState>((set, get) => ({
  games: [],
  activeGameId: null,
  loadGames: async () => {
    const games = await localforage.getItem<Game[]>('catalog') || [];
    set({ games });
  },
  addGame: async (file: File) => {
    const id = crypto.randomUUID();
    const buffer = await file.arrayBuffer();
    await localforage.setItem(\`rom_\${id}\`, buffer);
    const newGame: Game = {
      id,
      title: file.name.replace(/\\.(nes)$/i, ''),
      addedAt: Date.now()
    };
    const updatedGames = [...get().games, newGame];
    await localforage.setItem('catalog', updatedGames);
    set({ games: updatedGames });
  },
  playGame: (id) => set({ activeGameId: id }),
  stopGame: () => set({ activeGameId: null }),
  getRomBuffer: async (id) => {
    return await localforage.getItem<ArrayBuffer>(\`rom_\${id}\`);
  }
}));`,

  'src/components/Catalog.tsx': `import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Play, Upload } from 'lucide-react';

export const Catalog: React.FC = () => {
  const { games, loadGames, addGame, playGame } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadGames();
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist();
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await addGame(files[0]);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Библиотека NES</h1>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Upload size={20} />
          <span>Добавить игру (.nes)</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          accept=".nes" 
          className="hidden" 
          onChange={handleFileUpload} 
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {games.map(game => (
          <div key={game.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100">
            <div className="h-40 bg-gray-100 flex items-center justify-center">
               <span className="text-gray-300 font-bold text-4xl">NES</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 truncate mb-4">{game.title}</h3>
              <button 
                onClick={() => playGame(game.id)}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Play size={16} fill="currentColor" />
                Играть
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};`,

  'src/components/Gamepad.tsx': `import React, { useCallback, useEffect } from 'react';
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
  
  // Добавляем поддержку клавиатуры для тестов на ПК
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
      if (keyMap[e.key] !== undefined) onButtonDown(keyMap[e.key]);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (keyMap[e.key] !== undefined) onButtonUp(keyMap[e.key]);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [onButtonDown, onButtonUp]);

  return (
    <div className="flex justify-between items-end p-6 select-none w-full max-w-2xl mt-4" style={{ touchAction: 'none' }}>
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-32 h-32 bg-gray-800 rounded-full p-2">
        <div />
        <button className="bg-gray-600 rounded-t-md active:bg-gray-500" onPointerDown={handleStart(Controller.BUTTON_UP)} onPointerUp={handleEnd(Controller.BUTTON_UP)} onPointerLeave={handleEnd(Controller.BUTTON_UP)} />
        <div />
        <button className="bg-gray-600 rounded-l-md active:bg-gray-500" onPointerDown={handleStart(Controller.BUTTON_LEFT)} onPointerUp={handleEnd(Controller.BUTTON_LEFT)} onPointerLeave={handleEnd(Controller.BUTTON_LEFT)} />
        <div className="bg-gray-600" />
        <button className="bg-gray-600 rounded-r-md active:bg-gray-500" onPointerDown={handleStart(Controller.BUTTON_RIGHT)} onPointerUp={handleEnd(Controller.BUTTON_RIGHT)} onPointerLeave={handleEnd(Controller.BUTTON_RIGHT)} />
        <div />
        <button className="bg-gray-600 rounded-b-md active:bg-gray-500" onPointerDown={handleStart(Controller.BUTTON_DOWN)} onPointerUp={handleEnd(Controller.BUTTON_DOWN)} onPointerLeave={handleEnd(Controller.BUTTON_DOWN)} />
        <div />
      </div>
      <div className="flex gap-4 mb-4">
        <button className="w-16 h-16 bg-red-600 rounded-full shadow-lg active:bg-red-700 text-white font-bold text-xl" onPointerDown={handleStart(Controller.BUTTON_B)} onPointerUp={handleEnd(Controller.BUTTON_B)} onPointerLeave={handleEnd(Controller.BUTTON_B)}>B</button>
        <button className="w-16 h-16 bg-red-600 rounded-full shadow-lg active:bg-red-700 text-white font-bold text-xl" onPointerDown={handleStart(Controller.BUTTON_A)} onPointerUp={handleEnd(Controller.BUTTON_A)} onPointerLeave={handleEnd(Controller.BUTTON_A)}>A</button>
      </div>
    </div>
  );
};`,

  'src/components/Player.tsx': `import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { NESEmulator } from '../lib/emulator/NESEmulator';
import { Gamepad } from './Gamepad';

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 w-full">
      <div className="w-full max-w-2xl bg-black rounded-lg p-2 shadow-2xl relative flex justify-center">
         <button 
           onClick={stopGame}
           className="absolute -top-4 -right-4 bg-red-600 hover:bg-red-700 text-white rounded-full px-4 py-2 shadow-lg z-10"
         >
           Выход
         </button>
         <canvas 
           ref={canvasRef} 
           width={256} 
           height={240} 
           className="bg-black block"
           style={{ imageRendering: 'pixelated', transform: 'scale(1.5)', transformOrigin: 'top center', marginBottom: '120px', marginTop: '20px' }}
         />
      </div>
      <Gamepad 
        onButtonDown={(btn) => emulatorRef.current?.buttonDown(1, btn)} 
        onButtonUp={(btn) => emulatorRef.current?.buttonUp(1, btn)} 
      />
    </div>
  );
};`,

  'src/App.tsx': `import React from 'react';
import { useStore } from './store/useStore';
import { Catalog } from './components/Catalog';
import { Player } from './components/Player';

function App() {
  const activeGameId = useStore(state => state.activeGameId);
  return activeGameId ? <Player /> : <Catalog />;
}

export default App;`,
  
  'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filepath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('Files generated successfully.');
