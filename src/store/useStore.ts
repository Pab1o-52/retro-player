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
      title: file.name.replace(/\.(nes)$/i, ''),
      addedAt: Date.now()
    };
    const updatedGames = [...get().games, newGame];
    await localforage.setItem('catalog', updatedGames);
    set({ games: updatedGames });
  },
  playGame: (id) => set({ activeGameId: id }),
  stopGame: () => set({ activeGameId: null }),
  getRomBuffer: async (id) => {
    return await localforage.getItem<ArrayBuffer>(`rom_${id}`);
  },
  removeGame: async (id: string) => {
    // Удаляем сам ROM файл
    await localforage.removeItem(`rom_${id}`);
    
    // Удаляем из каталога
    const updatedGames = get().games.filter(g => g.id !== id);
    await localforage.setItem('catalog', updatedGames);
    
    set({ games: updatedGames });
  }
}));