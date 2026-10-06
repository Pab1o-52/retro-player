import re
with open('src/components/Gamepad.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = '''  const handleJoystickStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setJoystickCenter({ x: touch.clientX, y: touch.clientY });
    setJoystickThumb({ x: touch.clientX, y: touch.clientY });
    triggerVibration();
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!joystickCenter) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - joystickCenter.x;
    const dy = touch.clientY - joystickCenter.y;'''

replacement = '''  const handleJoystickStart = (e: React.PointerEvent) => {
    e.preventDefault();
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch (err) {}
    setJoystickCenter({ x: e.clientX, y: e.clientY });
    setJoystickThumb({ x: e.clientX, y: e.clientY });
    triggerVibration();
  };

  const handleJoystickMove = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!joystickCenter) return;
    
    const dx = e.clientX - joystickCenter.x;
    const dy = e.clientY - joystickCenter.y;'''

code = code.replace(target, replacement)

target2 = '''            onTouchStart={handleJoystickStart}
            onTouchMove={handleJoystickMove}
            onTouchEnd={handleJoystickEnd}
            onTouchCancel={handleJoystickEnd}'''

replacement2 = '''            onPointerDown={handleJoystickStart}
            onPointerMove={handleJoystickMove}
            onPointerUp={handleJoystickEnd}
            onPointerCancel={handleJoystickEnd}'''

code = code.replace(target2, replacement2)

with open('src/components/Gamepad.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
