import re
with open('src/components/Gamepad.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = r'(<div\s*className="relative w-\[180px\].*?)\{\/\* .*?\*\/}\s*<div style=\{\{ transform: scale\(\$\{scale\}\), transformOrigin: \'bottom right\' \}\}>'

replacement = r'''        {type === 'analog' ? (
          <div 
            className="relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] flex items-center justify-center shrink-0 select-none border-2 border-dashed border-gray-700/50 rounded-full bg-gray-800/30 touch-none"
            style={{ transform: scale(), transformOrigin: 'bottom left' }}
            onPointerDown={handleJoystickStart}
            onPointerMove={handleJoystickMove}
            onPointerUp={handleJoystickEnd}
            onPointerCancel={handleJoystickEnd}
          >
            <span className="text-gray-600/50 font-bold text-center pointer-events-none px-4 text-sm">
              Стик<br/>(тяните)
            </span>

            {joystickCenter && joystickThumb && (
              <>
                <div 
                  className="fixed bg-gray-800/90 border-4 border-gray-600 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none z-50 backdrop-blur-sm"
                  style={{ 
                    left: joystickCenter.x, top: joystickCenter.y, 
                    width: ${100 * scale}px, height: ${100 * scale}px,
                    transform: 'translate(-50%, -50%)' 
                  }}
                />
                <div 
                  className="fixed bg-gradient-to-b from-blue-400 to-blue-600 rounded-full border-2 border-blue-300 pointer-events-none z-50 shadow-lg shadow-blue-500/50"
                  style={{ 
                    left: joystickThumb.x, top: joystickThumb.y,
                    width: ${50 * scale}px, height: ${50 * scale}px,
                    transform: 'translate(-50%, -50%)' 
                  }}
                />
              </>
            )}
          </div>
        ) : (
          <div 
            className="relative w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] flex shrink-0 select-none items-center justify-center touch-none"
            style={{ transform: scale(), transformOrigin: 'bottom left' }}
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
              <div className="absolute w-10 h-10 bg-gray-500 rounded-sm pointer-events-none"></div>
            </div>
          </div>
        )}

        <div style={{ transform: scale(), transformOrigin: 'bottom right' }}>'''

code = re.sub(target, replacement, code, flags=re.DOTALL)

with open('src/components/Gamepad.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
