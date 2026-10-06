import re
with open('src/store/useStore.ts', 'r', encoding='utf-8') as f:
    code = f.read()

target = 'set({ games: catalog, activeGameId: gameId });'
replacement = 'set({ games: catalog, activeGameId: gameId, netplayGameBuffer: buffer });'
code = code.replace(target, replacement)

target2 = '''    getRomBuffer: async (id: string) => {
      if (id === 'netplay-guest') return get().netplayGameBuffer;
      return await localforage.getItem<ArrayBuffer>(`rom_${id}`);
    },'''
replacement2 = '''    getRomBuffer: async (id: string) => {
      if (id === get().activeGameId && get().netplayGameBuffer) return get().netplayGameBuffer;
      return await localforage.getItem<ArrayBuffer>(`rom_${id}`);
    },'''
code = code.replace(target2, replacement2)

with open('src/store/useStore.ts', 'w', encoding='utf-8') as f:
    f.write(code)
