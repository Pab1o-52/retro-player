import re
with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = '''      const keyMap: Record<string, string> = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'KeyZ': 'a',
        'KeyX': 'b',
        'KeyC': 'c',
        'KeyA': 'x',
        'KeyS': 'y',
        'KeyD': 'z',
        'Enter': 'start',
        'ShiftRight': 'select',
        'ShiftLeft': 'select',
      };'''

replacement = '''      const keyMap: Record<string, string> = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'KeyW': 'up',
        'KeyS': 'down',
        'KeyA': 'left',
        'KeyD': 'right',
        'KeyZ': 'a',
        'KeyX': 'b',
        'KeyC': 'c',
        'KeyJ': 'x',
        'KeyK': 'y',
        'KeyL': 'z',
        'Enter': 'start',
        'ShiftRight': 'select',
        'ShiftLeft': 'select',
      };'''

code = code.replace(target, replacement)

with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
