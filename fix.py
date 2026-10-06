with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = 'setDebugLog(P2:  );'
replacement = 'setDebugLog(`P2: ${btn} ${isDown ? "DOWN" : "UP"}`);'

code = code.replace(target, replacement)

with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
