import re
with open('src/components/Gamepad.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# find first index of '        <div style={{ transform: `scale(${scale})`, transformOrigin: \'bottom right\' }}>'
end_idx = code.find('        <div style={{ transform: `scale(${scale})`, transformOrigin: \'bottom right\' }}>')

# find the `{/*` right after `        )}` which is around index 10000
start_idx = code.find('        )}', end_idx - 1500) + 10

if start_idx != -1 and end_idx != -1:
    code = code[:start_idx] + '\n' + code[end_idx:]

with open('src/components/Gamepad.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
