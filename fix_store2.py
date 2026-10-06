import re
with open('src/store/useStore.ts', 'r', encoding='utf-8') as f:
    code = f.read()

target = r"setNetplayGame:\s*\(title,\s*system,\s*buffer\)\s*=>\s*\{[\s\S]*?activeGameId:\s*'netplay-guest'\s*}\);"

replacement = '''setNetplayGame: async (title, system, buffer) => {
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
      
      set({ games: catalog, activeGameId: gameId });
    }'''

code = re.sub(target, replacement, code)

with open('src/store/useStore.ts', 'w', encoding='utf-8') as f:
    f.write(code)
