import re
with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = '''          scale={joystickScale}
          layout={buttonLayout}
        />'''
replacement = '''          scale={joystickScale}
          layout={buttonLayout}
          type={joystickType}
        />'''
code = code.replace(target, replacement)

with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
