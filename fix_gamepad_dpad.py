import re
with open('src/components/Gamepad.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target1 = '''  const handleJoystickStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const point = { x: touch.clientX, y: touch.clientY };'''
replacement1 = '''  const handleJoystickStart = (e: React.PointerEvent) => {
    e.preventDefault();
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch (err) {}
    const point = { x: e.clientX, y: e.clientY };'''
code = code.replace(target1, replacement1)

target2 = '''  const handleJoystickMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!joystickCenter) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - joystickCenter.x;
    const dy = touch.clientY - joystickCenter.y;
    
    const maxRadius = 50 * scale;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let thumbX = touch.clientX;
    let thumbY = touch.clientY;'''
replacement2 = '''  const handleJoystickMove = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!joystickCenter) return;
    
    const dx = e.clientX - joystickCenter.x;
    const dy = e.clientY - joystickCenter.y;
    
    const maxRadius = 50 * scale;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let thumbX = e.clientX;
    let thumbY = e.clientY;'''
code = code.replace(target2, replacement2)

target3 = '''  const handleJoystickEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setJoystickCenter(null);
    setJoystickThumb(null);'''
replacement3 = '''  const handleJoystickEnd = (e: React.PointerEvent) => {
    e.preventDefault();
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch (err) {}
    setJoystickCenter(null);
    setJoystickThumb(null);'''
code = code.replace(target3, replacement3)

target4 = '''        <div 
          className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] flex items-center justify-center shrink-0 select-none border-2 border-dashed border-gray-700/50 rounded-full bg-gray-800/30"
          style={{ transform: `scale(${scale})`, transformOrigin: 'bottom left' }}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
        >
          <span className="text-gray-600/50 font-bold text-center pointer-events-none px-4 text-sm">
            Коснитесь экрана<br/>(и тяните)
          </span>

          {/* Плавающий джойстик */}
          {joystickCenter && joystickThumb && (
            <>
              {/* Полупрозрачная база */}
              <div 
                className="fixed bg-gray-800/90 border-4 border-gray-600 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none z-50 backdrop-blur-sm"
                style={{ 
                  left: joystickCenter.x, top: joystickCenter.y, 
                  width: `${100 * scale}px`, height: `${100 * scale}px`,
                  transform: 'translate(-50%, -50%)' 
                }}
              />
              {/* Сам ползунок */}
              <div 
                className="fixed bg-gradient-to-b from-blue-400 to-blue-600 rounded-full border-2 border-blue-300 pointer-events-none z-50 shadow-lg shadow-blue-500/50"
                style={{ 
                  left: joystickThumb.x, top: joystickThumb.y,
                  width: `${50 * scale}px`, height: `${50 * scale}px`,
                  transform: 'translate(-50%, -50%)' 
                }}
              />
            </>
          )}
        </div>'''
replacement4 = '''        {type === 'analog' ? (
          <div 
            className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] flex items-center justify-center shrink-0 select-none border-2 border-dashed border-gray-700/50 rounded-full bg-gray-800/30 touch-none"
            style={{ transform: `scale(${scale})`, transformOrigin: 'bottom left' }}
            onPointerDown={handleJoystickStart}
            onPointerMove={handleJoystickMove}
            onPointerUp={handleJoystickEnd}
            onPointerCancel={handleJoystickEnd}
          >
            <span className="text-gray-600/50 font-bold text-center pointer-events-none px-4 text-sm">
              Коснитесь экрана<br/>(и тяните)
            </span>

            {joystickCenter && joystickThumb && (
              <>
                <div 
                  className="fixed bg-gray-800/90 border-4 border-gray-600 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none z-50 backdrop-blur-sm"
                  style={{ 
                    left: joystickCenter.x, top: joystickCenter.y, 
                    width: `${100 * scale}px`, height: `${100 * scale}px`,
                    transform: 'translate(-50%, -50%)' 
                  }}
                />
                <div 
                  className="fixed bg-gradient-to-b from-blue-400 to-blue-600 rounded-full border-2 border-blue-300 pointer-events-none z-50 shadow-lg shadow-blue-500/50"
                  style={{ 
                    left: joystickThumb.x, top: joystickThumb.y,
                    width: `${50 * scale}px`, height: `${50 * scale}px`,
                    transform: 'translate(-50%, -50%)' 
                  }}
                />
              </>
            )}
          </div>
        ) : (
          <div 
            className="relative w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] flex shrink-0 select-none items-center justify-center touch-none"
            style={{ transform: `scale(${scale})`, transformOrigin: 'bottom left' }}
          >
            <div className="relative w-32 h-32 flex items-center justify-center bg-gray-800/50 rounded-full shadow-[inset_0_5px_15px_rgba(0,0,0,0.8)]">
              {/* UP */}
              <button 
                className="absolute top-0 w-10 h-12 bg-gray-600 rounded-t-lg active:bg-gray-400 active:scale-95 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"
                onPointerDown={handleStart('up')} onPointerUp={handleEnd('up')} onPointerLeave={handleEnd('up')}
              />
              {/* DOWN */}
              <button 
                className="absolute bottom-0 w-10 h-12 bg-gray-600 rounded-b-lg active:bg-gray-400 active:scale-95 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"
                onPointerDown={handleStart('down')} onPointerUp={handleEnd('down')} onPointerLeave={handleEnd('down')}
              />
              {/* LEFT */}
              <button 
                className="absolute left-0 w-12 h-10 bg-gray-600 rounded-l-lg active:bg-gray-400 active:scale-95 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"
                onPointerDown={handleStart('left')} onPointerUp={handleEnd('left')} onPointerLeave={handleEnd('left')}
              />
              {/* RIGHT */}
              <button 
                className="absolute right-0 w-12 h-10 bg-gray-600 rounded-r-lg active:bg-gray-400 active:scale-95 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]"
                onPointerDown={handleStart('right')} onPointerUp={handleEnd('right')} onPointerLeave={handleEnd('right')}
              />
              {/* CENTER */}
              <div className="absolute w-10 h-10 bg-gray-500 rounded-sm"></div>
            </div>
          </div>
        )}'''
code = code.replace(target4, replacement4)

with open('src/components/Gamepad.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
