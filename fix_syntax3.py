import re
with open('src/components/Gamepad.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# We need to find `        )}` 
# And then remove everything up to `        <div style={{ transform: `scale(${scale})`, transformOrigin: 'bottom right' }}>`
# except for keeping the `        )}`

target_start = code.rfind('        )}') + 10
target_end = code.rfind('        <div style={{ transform: `scale(${scale})`, transformOrigin: \'bottom right\' }}>')
if target_start != -1 and target_end != -1:
    code = code[:target_start] + '\n' + code[target_end:]

with open('src/components/Gamepad.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
