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
  saveGameState: (id: string, stateData: any) => Promise<void>;
  loadGameState: (id: string) => Promise<any | null>;
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
  }
}));
