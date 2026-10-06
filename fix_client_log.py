import re
with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = '        const btn = keyMap[e.code];\n        if (btn) {'
replacement = '        const btn = keyMap[e.code];\n        setDebugLog(`Key: ${e.code} -> ${btn || "None"}`);\n        if (btn) {'

code = code.replace(target, replacement)

with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
