import { create } from 'zustand';
import localforage from 'localforage';

localforage.config({
  name: 'RetroPlayer',
  storeName: 'roms_and_saves'
});

export interface Game {
  id: string;
  title: string;
  addedAt: number;
  system: string;
}

interface EmulatorState {
  games: Game[];
  activeGameId: string | null;
  loadGames: () => Promise<void>;
  addGame: (file: File) => Promise<void>;
  playGame: (id: string) => void;
  stopGame: () => void;
  getRomBuffer: (id: string) => Promise<ArrayBuffer | null>;
  removeGame: (id: string) => Promise<void>;
  saveGameState: (id: string, stateData: any) => Promise<void>;
  loadGameState: (id: string) => Promise<any | null>;
  joystickScale: number;
  setJoystickScale: (scale: number) => void;
  buttonLayout: 2 | 3 | 4 | 6;
  setButtonLayout: (layout: 2 | 3 | 4 | 6) => void;
  joystickType: 'analog' | 'dpad';
  setJoystickType: (type: 'analog' | 'dpad') => void;
  isEditingLayout: boolean;
  setIsEditingLayout: (isEditingLayout: boolean) => void;
  gamepadOffsets: {
    portrait: { left: {x: number, y: number}, right: {x: number, y: number} },
    landscape: { left: {x: number, y: number}, right: {x: number, y: number} }
  };
  setGamepadOffsets: (offsets: any) => void;
  keyBinds: Record<string, string>;
  setKeyBinds: (binds: Record<string, string>) => void;
  netplayStatus: string | null;
  setNetplayStatus: (status: string | null) => void;
  netplayGameBuffer: ArrayBuffer | null;
  setNetplayGame: (title: string, system: string, buffer: ArrayBuffer) => void;
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
    await localforage.setItem(`rom_${id}`, buffer);
    const newGame: Game = {
      id,
      title: file.name.replace(/\.[a-zA-Z0-9]+$/i, ''),
      system: file.name.toLowerCase().endsWith('.md') || file.name.toLowerCase().endsWith('.gen') || file.name.toLowerCase().endsWith('.smd') || file.name.toLowerCase().endsWith('.bin') ? 'sega' : 'nes',
      addedAt: Date.now()
    };
    const updatedGames = [...get().games, newGame];
    await localforage.setItem('catalog', updatedGames);
    set({ games: updatedGames });
  },
  playGame: (id) => set({ activeGameId: id }),
  stopGame: () => {
    set({ activeGameId: null, netplayGameBuffer: null, netplayStatus: null });
  },
  getRomBuffer: async (id) => {
    if (id === get().activeGameId && get().netplayGameBuffer) return get().netplayGameBuffer;
    return await localforage.getItem<ArrayBuffer>(`rom_${id}`);
  },
  removeGame: async (id: string) => {
    await localforage.removeItem(`rom_${id}`);
    const updatedGames = get().games.filter(g => g.id !== id);
    await localforage.setItem('catalog', updatedGames);
    set({ games: updatedGames });
  },
  saveGameState: async (id, stateData) => {
    await localforage.setItem(`save_${id}`, stateData);
  },
  loadGameState: async (id) => {
    return await localforage.getItem(`save_${id}`);
  },
  joystickScale: 1,
  setJoystickScale: (scale) => set({ joystickScale: scale }),
  buttonLayout: 6,
  setButtonLayout: (layout) => set({ buttonLayout: layout }),
  joystickType: 'analog',
  setJoystickType: (type) => set({ joystickType: type }),
  isEditingLayout: false,
  setIsEditingLayout: (isEditingLayout) => set({ isEditingLayout }),
  gamepadOffsets: JSON.parse(localStorage.getItem('gamepadOffsets') || 'null') || {
    portrait: { left: {x:0, y:0}, right: {x:0, y:0} },
    landscape: { left: {x:0, y:0}, right: {x:0, y:0} }
  },
  setGamepadOffsets: (offsets) => {
    localStorage.setItem('gamepadOffsets', JSON.stringify(offsets));
    set({ gamepadOffsets: offsets });
  },
  keyBinds: {
    up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight',
    a: 'KeyZ', b: 'KeyX', c: 'KeyC', x: 'KeyA', y: 'KeyS', z: 'KeyD',
    start: 'Enter', select: 'ShiftLeft'
  },
  setKeyBinds: (binds) => set({ keyBinds: binds }),
  netplayStatus: null,
  setNetplayStatus: (status) => set({ netplayStatus: status }),
  netplayGameBuffer: null,
  setNetplayGame: async (title, system, buffer) => {
      let catalog = await localforage.getItem<Game[]>('catalog') || [];
      let existing = catalog.find(g => g.title === title && g.system === system);
      let gameId = existing?.id;
      
      if (!gameId) {
        gameId = crypto.randomUUID();
        await localforage.setItem(`rom_${gameId}`, buffer);
        const newGame = {
          id: gameId,
          title,
          addedAt: Date.now(),
          system
        };
        catalog = [newGame, ...catalog];
        await localforage.setItem('catalog', catalog);
      } else {
        await localforage.setItem(`rom_${gameId}`, buffer);
      }
      
      set({ games: catalog, activeGameId: gameId, netplayGameBuffer: buffer });
    }
}));


