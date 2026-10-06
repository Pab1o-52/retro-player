import re
with open('src/components/Gamepad.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target1 = '''  scale: number;
  layout: 2 | 3 | 4 | 6;
}'''
replacement1 = '''  scale: number;
  layout: 2 | 3 | 4 | 6;
  type?: 'analog' | 'dpad';
}'''
code = code.replace(target1, replacement1)

target2 = '''export const Gamepad = ({ onButtonDown, onButtonUp, scale, layout }: GamepadProps) => {'''
replacement2 = '''export const Gamepad = ({ onButtonDown, onButtonUp, scale, layout, type = 'analog' }: GamepadProps) => {'''
code = code.replace(target2, replacement2)

with open('src/components/Gamepad.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
