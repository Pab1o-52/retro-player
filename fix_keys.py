import re
with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target1 = '''            input_player2_right: 'h','''
replacement1 = '''            input_player2_right: 'h',
            
            // P1 Keyboard Map (ZXC = ABC, ASD = XYZ)
            input_player1_y: 'z', // Sega A
            input_player1_b: 'x', // Sega B
            input_player1_a: 'c', // Sega C
            input_player1_l: 'a', // Sega X
            input_player1_x: 's', // Sega Y
            input_player1_r: 'd', // Sega Z
            input_player1_start: 'enter',
            input_player1_select: 'shift',
            input_player1_up: 'up',
            input_player1_down: 'down',
            input_player1_left: 'left',
            input_player1_right: 'right','''
code = code.replace(target1, replacement1)

target2 = '''        'KeyZ': 'a',
        'KeyX': 'b',
        'KeyC': 'c',
        'KeyJ': 'x',
        'KeyK': 'y',
        'KeyL': 'z','''
replacement2 = '''        'KeyZ': 'a',
        'KeyX': 'b',
        'KeyC': 'c',
        'KeyA': 'x',
        'KeyS': 'y',
        'KeyD': 'z','''
code = code.replace(target2, replacement2)

with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
