import re
with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = code.replace(
    'const onKeyDown = (e: KeyboardEvent) => {',
    'const onKeyDown = (e: KeyboardEvent) => {\n        if (e.repeat) return;'
)

with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
