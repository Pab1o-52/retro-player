import re
with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = r'<div className="flex flex-col gap-2 mt-2">\s*<label className="text-gray-300 font-medium">Тип крестовины:</label>\s*<div className="flex gap-2">\s*\{\['\''analog'\'', '\''dpad'\''\]\.map\(type => \(\s*<button\s*key=\{type\}\s*onClick=\{\(\) => setJoystickType\(type as any\)\}\s*className=\{`flex-1 py-1 rounded font-bold transition-colors \$\{joystickType === type \? '\''bg-blue-600 text-white'\'' : '\''bg-gray-700 text-gray-300 hover:bg-gray-600'\''\}`\}\s*>\s*\{type === '\''analog'\'' \? '\''Стик \(Аналог\)'\'' : '\''Классика \(D-Pad\)'\''\}\s*</button>\s*\)\)\}\s*</div>\s*</div>'

code = re.sub(target, '', code)

with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
