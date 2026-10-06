import re
with open('src/store/useStore.ts', 'r', encoding='utf-8') as f:
    code = f.read()

target1 = '''  buttonLayout: 2 | 3 | 4 | 6;
  setButtonLayout: (layout: 2 | 3 | 4 | 6) => void;'''
replacement1 = '''  buttonLayout: 2 | 3 | 4 | 6;
  setButtonLayout: (layout: 2 | 3 | 4 | 6) => void;
  joystickType: 'analog' | 'dpad';
  setJoystickType: (type: 'analog' | 'dpad') => void;'''
code = code.replace(target1, replacement1)

target2 = '''  buttonLayout: 6,
  setButtonLayout: (layout) => set({ buttonLayout: layout }),'''
replacement2 = '''  buttonLayout: 6,
  setButtonLayout: (layout) => set({ buttonLayout: layout }),
  joystickType: 'analog',
  setJoystickType: (type) => set({ joystickType: type }),'''
code = code.replace(target2, replacement2)

with open('src/store/useStore.ts', 'w', encoding='utf-8') as f:
    f.write(code)
