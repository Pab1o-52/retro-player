import re
with open('src/store/useStore.ts', 'r', encoding='utf-8') as f:
    code = f.read()

target = '''      set({ games: catalog, activeGameId: gameId });
    }
  }
}));'''
replacement = '''      set({ games: catalog, activeGameId: gameId });
    }
}));'''
code = code.replace(target, replacement)
with open('src/store/useStore.ts', 'w', encoding='utf-8') as f:
    f.write(code)
