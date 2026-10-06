import re
with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = 'netplayManager.sendRom(activeGame!.title, activeGame!.system, new ArrayBuffer(0)); // Empty buffer for cloud gaming'
replacement = 'netplayManager.sendRom(activeGame!.title, activeGame!.system, buffer); // Send actual ROM so client saves it'

code = code.replace(target, replacement)

with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
