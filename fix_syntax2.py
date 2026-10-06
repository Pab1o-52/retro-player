import re
with open('src/components/Gamepad.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = r'(        \}\)\s*\{\/\* .*?\*\/\}\s*\{joystickCenter && joystickThumb && \(\s*<>\s*\{\/\* .*?\*\/\}\s*<div\s*className="fixed bg-gray-800/90 .*?/\>\s*\{\/\* .*?\*\/\}\s*<div\s*className="fixed bg-gradient-to-b .*?/\>\s*</>\s*\)\}\s*</div>)'

code = re.sub(target, '', code, flags=re.DOTALL)

with open('src/components/Gamepad.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
