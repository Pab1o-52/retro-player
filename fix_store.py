import re
with open('src/store/useStore.ts', 'r', encoding='utf-8') as f:
    code = f.read()

target = '''    netplayGameBuffer: null,
    setNetplayGame: (title, system, buffer) => {
      // Add temporary game to list if not there
      const tempGame = { id: 'netplay-guest', title, system, addedAt: Date.now() };
      const games = get().games.filter(g => g.id !== 'netplay-guest');
      set({ games: [tempGame, ...games], netplayGameBuffer: buffer, activeGameId: 'netplay-guest' });
    }'''

replacement = '''    netplayGameBuffer: null,
    setNetplayGame: async (title, system, buffer) => {
      const catalog = (await localforage.getItem<{id: string, title: string, addedAt: number, system: string}[]>('catalog')) || [];
      const existing = catalog.find(g => g.title === title && g.system === system);
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
        catalog.unshift(newGame);
        await localforage.setItem('catalog', catalog);
      } else {
        // Update existing just to be sure we have the latest buffer if it changed
        await localforage.setItem(`rom_${gameId}`, buffer);
      }
      
      set({ games: catalog, activeGameId: gameId });
    }'''

code = code.replace(target, replacement)

with open('src/store/useStore.ts', 'w', encoding='utf-8') as f:
    f.write(code)
