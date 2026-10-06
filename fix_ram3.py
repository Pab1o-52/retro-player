import re
with open('src/store/useStore.ts', 'r', encoding='utf-8') as f:
    code = f.read()

target = '''  getRomBuffer: async (id) => {
    if (id === 'netplay-guest') return get().netplayGameBuffer;
    return await localforage.getItem<ArrayBuffer>(`rom_${id}`);
  },'''
replacement = '''  getRomBuffer: async (id) => {
    if (id === get().activeGameId && get().netplayGameBuffer) return get().netplayGameBuffer;
    return await localforage.getItem<ArrayBuffer>(`rom_${id}`);
  },'''
code = code.replace(target, replacement)

with open('src/store/useStore.ts', 'w', encoding='utf-8') as f:
    f.write(code)
