import re
with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = '''          retroarchConfig: {
              input_libretro_device_p1: 1,
              input_libretro_device_p2: 1,
              input_player2_joypad_index: 1,
              pause_nonactive: false,
            input_libretro_device_p1: 1,
            input_libretro_device_p2: 1,
            input_player2_joypad_index: 1,
            input_player2_start: 'num1',
            input_player2_select: 'num2',
            input_player2_a: 'num3',
            input_player2_b: 'num4',
            input_player2_x: 'num5',
            input_player2_y: 'num6',
            input_player2_l: 'num7',
            input_player2_r: 'num8',
            input_player2_up: 'w',
            input_player2_down: 's',
            input_player2_left: 'a',
            input_player2_right: 'd','''

replacement = '''          retroarchConfig: {
            input_libretro_device_p1: 1,
            input_libretro_device_p2: 1,
            input_player2_joypad_index: 1,
            pause_nonactive: false,
            input_player2_start: 'u',
            input_player2_select: 'i',
            input_player2_a: 'j',
            input_player2_b: 'k',
            input_player2_x: 'l',
            input_player2_y: 'm',
            input_player2_l: 'n',
            input_player2_r: 'o',
            input_player2_up: 't',
            input_player2_down: 'g',
            input_player2_left: 'f',
            input_player2_right: 'h','''

code = code.replace(target, replacement)
with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
