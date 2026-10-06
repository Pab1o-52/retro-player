with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target_config = 'retroarchConfig: {'
replacement_config = '''retroarchConfig: {
              input_libretro_device_p1: 1,
              input_libretro_device_p2: 1,
              input_player2_joypad_index: 1,'''

if target_config in code:
    code = code.replace(target_config, replacement_config)

target_hack = 'export const Player = () => {'
replacement_hack = '''// Force Emscripten to always accept keyboard events even if window loses focus
try {
  Object.defineProperty(document, 'hasFocus', { get: () => () => true });
} catch (e) {}

export const Player = () => {'''

if target_hack in code:
    code = code.replace(target_hack, replacement_hack)

with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
