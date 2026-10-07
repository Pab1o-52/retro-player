import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../store/useStore';


interface GamepadProps {
  onButtonDown: (btn: string) => void;
  onButtonUp: (btn: string) => void;
  scale?: number;
  layout: 2 | 3 | 4 | 6;
  type?: 'analog' | 'dpad';
}

interface Point {
  x: number;
  y: number;
}

export const Gamepad = ({ onButtonDown, onButtonUp, scale = 1, layout = 2, type = 'analog' }: GamepadProps) => {
  const [isLandscape, setIsLandscape] = useState(false);
  useEffect(() => {
    const checkOrientation = () => setIsLandscape(window.innerWidth > window.innerHeight);
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);
  const finalScale = scale * (isLandscape ? 0.7 : 0.9);

  const { isEditingLayout, gamepadOffsets } = useStore();
  const currentOffsets = isLandscape ? gamepadOffsets.landscape : gamepadOffsets.portrait;

  const handleDrag = (side: 'left' | 'right') => (e: React.PointerEvent) => {
    if (!isEditingLayout) return;
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialOffset = { ...currentOffsets[side] };

    const onMove = (moveEv: PointerEvent) => {
      const dx = moveEv.clientX - startX;
      const dy = moveEv.clientY - startY;
      const newOffsets = JSON.parse(JSON.stringify(useStore.getState().gamepadOffsets));
      const mode = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      newOffsets[mode][side] = { x: initialOffset.x + dx, y: initialOffset.y + dy };
      useStore.getState().setGamepadOffsets(newOffsets);
    };

    const onUp = (upEv: PointerEvent) => {
      try { target.releasePointerCapture(upEv.pointerId); } catch(e){}
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const [joystickCenter, setJoystickCenter] = useState<Point | null>(null);
  const [joystickThumb, setJoystickThumb] = useState<Point | null>(null);
  
  const activeBtns = useRef<Set<string>>(new Set());

  const triggerVibration = () => {
    if (navigator.vibrate) navigator.vibrate(15); 
  };

  const handleStart = (btn: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch (err) {}
    triggerVibration();
    onButtonDown(btn);
  };

  const handleEnd = (btn: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch (err) {}
    onButtonUp(btn);
  };

  // --- ЛОГИКА ПЛАВАЮЩЕГО ДЖОЙСТИКА ---
  const handleJoystickStart = (e: React.PointerEvent) => {
    e.preventDefault();
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch (err) {}
    const point = { x: e.clientX, y: e.clientY };
    setJoystickCenter(point);
    setJoystickThumb(point);
    triggerVibration();
  };

  const handleJoystickMove = (e: React.PointerEvent) => {
    e.preventDefault();
    if (!joystickCenter) return;
    
    const dx = e.clientX - joystickCenter.x;
    const dy = e.clientY - joystickCenter.y;
    
    const maxRadius = 50 * finalScale;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let thumbX = e.clientX;
    let thumbY = e.clientY;

    if (distance > maxRadius) {
      const angle = Math.atan2(dy, dx);
      thumbX = joystickCenter.x + Math.cos(angle) * maxRadius;
      thumbY = joystickCenter.y + Math.sin(angle) * maxRadius;
    }
    
    setJoystickThumb({ x: thumbX, y: thumbY });

    const deadzone = 15 * finalScale;
    const newActive = new Set<string>();

    if (distance > deadzone) {
      if (dx < -deadzone) newActive.add('left');
      if (dx > deadzone) newActive.add('right');
      if (dy < -deadzone) newActive.add('up');
      if (dy > deadzone) newActive.add('down');
    }

    activeBtns.current.forEach(btn => {
      if (!newActive.has(btn)) onButtonUp(btn);
    });
    newActive.forEach(btn => {
      if (!activeBtns.current.has(btn)) onButtonDown(btn);
    });

    activeBtns.current = newActive;
  };

  const handleJoystickEnd = (e: React.PointerEvent) => {
    e.preventDefault();
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch (err) {}
    setJoystickCenter(null);
    setJoystickThumb(null);
    
    activeBtns.current.forEach(btn => onButtonUp(btn));
    activeBtns.current.clear();
  };

  const renderActionButtons = () => {
    const ActionBtn = ({ label, code, mb = 0, sizeClass = "w-14 h-14 sm:w-20 sm:h-20" }: any) => (
      <div className={`flex flex-col items-center justify-end ${mb ? `mb-${mb}` : ''}`}>
        <button 
          className={`${sizeClass} rounded-full bg-red-600 shadow-[inset_0_4px_4px_rgba(255,255,255,0.3),0_6px_0_#7f1d1d,0_10px_15px_rgba(0,0,0,0.5)] active:translate-y-[6px] active:shadow-[inset_0_2px_2px_rgba(255,255,255,0.1),0_0px_0_#7f1d1d,0_4px_5px_rgba(0,0,0,0.5)] text-white font-extrabold text-xl sm:text-3xl transition-all flex items-center justify-center`}
          onPointerDown={handleStart(code)} 
          onPointerUp={handleEnd(code)} 
          onPointerLeave={handleEnd(code)}
        >
          {label}
        </button>
      </div>
    );

    const containerClass = "bg-gray-800 p-4 sm:p-6 rounded-[50px] shadow-[inset_0_4px_15px_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.5)] border-4 border-gray-700 shrink-0";

    if (layout === 2) {
      return (
        <div className={`flex gap-4 sm:gap-6 items-end pb-2 sm:pb-4 ${containerClass}`}>
          <ActionBtn label="B" code="b" />
          <ActionBtn label="A" code="a" mb={4} />
        </div>
      );
    }

    if (layout === 3) {
      return (
        <div className={`flex gap-3 sm:gap-5 items-end pb-2 sm:pb-4 ${containerClass}`}>
          <ActionBtn label="A" code="a" />
          <ActionBtn label="B" code="b" mb={4} />
          <ActionBtn label="C" code="c" mb={8} />
        </div>
      );
    }

    if (layout === 4) {
      return (
        <div className={`${containerClass} relative w-[160px] h-[160px] sm:w-[220px] sm:h-[220px] !rounded-full`}>
          <div className="absolute top-2 left-1/2 -translate-x-1/2"><ActionBtn label="Y" code="y" sizeClass="w-12 h-12 sm:w-16 sm:h-16" /></div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2"><ActionBtn label="B" code="b" sizeClass="w-12 h-12 sm:w-16 sm:h-16" /></div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2"><ActionBtn label="X" code="x" sizeClass="w-12 h-12 sm:w-16 sm:h-16" /></div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2"><ActionBtn label="A" code="a" sizeClass="w-12 h-12 sm:w-16 sm:h-16" /></div>
        </div>
      );
    }

    if (layout === 6) {
      const sClass = "w-11 h-11 sm:w-14 sm:h-14";
      return (
        <div className={`flex flex-col gap-2 p-3 sm:p-5 ${containerClass} !rounded-[40px]`}>
          <div className="flex gap-2 sm:gap-3 items-end">
            <ActionBtn label="X" code="x" sizeClass={sClass} />
            <ActionBtn label="Y" code="y" sizeClass={sClass} mb={2} />
            <ActionBtn label="Z" code="z" sizeClass={sClass} mb={4} />
          </div>
          <div className="flex gap-2 sm:gap-3 items-end ml-4 sm:ml-6">
            <ActionBtn label="A" code="a" sizeClass={sClass} />
            <ActionBtn label="B" code="b" sizeClass={sClass} mb={2} />
            <ActionBtn label="C" code="c" sizeClass={sClass} mb={4} />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 landscape:gap-10 mt-auto landscape:absolute landscape:bottom-2 landscape:left-0 landscape:right-0 landscape:z-[60] landscape:opacity-60 landscape:px-2" style={{ touchAction: 'none' }}>
      
      {/* Кнопки Select / Start */}
      <div className="flex gap-6 justify-center shrink-0 md:order-last md:mt-4">
        <div className="flex flex-col items-center">
          <button 
            className="w-16 h-6 bg-gray-900 rounded-full border-2 border-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_2px_0_rgba(255,255,255,0.1)] active:translate-y-1 active:shadow-[inset_0_4px_6px_rgba(0,0,0,0.9)] transition-all"
            onPointerDown={handleStart('select')} 
            onPointerUp={handleEnd('select')} 
            onPointerLeave={handleEnd('select')}
          />
          <span className="text-gray-400 font-bold mt-1 text-xs uppercase tracking-widest">Select</span>
        </div>
        <div className="flex flex-col items-center">
          <button 
            className="w-16 h-6 bg-gray-900 rounded-full border-2 border-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_2px_0_rgba(255,255,255,0.1)] active:translate-y-1 active:shadow-[inset_0_4px_6px_rgba(0,0,0,0.9)] transition-all"
            onPointerDown={handleStart('start')} 
            onPointerUp={handleEnd('start')} 
            onPointerLeave={handleEnd('start')}
          />
          <span className="text-gray-400 font-bold mt-1 text-xs uppercase tracking-widest">Start</span>
        </div>
      </div>

      <div className="flex flex-row justify-between items-end pb-8 landscape:pb-4 pr-6 landscape:pr-0">
        
        {/* Зона плавающего джойстика */}
        {type === 'analog' ? (
          <div 
            className={`relative w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] flex items-center justify-center shrink-0 select-none border-2 border-dashed border-gray-700/50 rounded-full bg-gray-800/30 touch-none ${isEditingLayout ? 'ring-4 ring-green-500 cursor-move' : ''}`}
            style={{ transform: `translate(${currentOffsets.left.x}px, ${currentOffsets.left.y}px) scale(${finalScale})`, transformOrigin: 'bottom left' }}
            onPointerDown={isEditingLayout ? handleDrag('left') : handleJoystickStart}
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
                    width: `${100 * finalScale}px`, height: `${100 * finalScale}px`,
                    transform: 'translate(-50%, -50%)' 
                  }}
                />
                <div 
                  className="fixed bg-gradient-to-b from-blue-400 to-blue-600 rounded-full border-2 border-blue-300 pointer-events-none z-50 shadow-lg shadow-blue-500/50"
                  style={{ 
                    left: joystickThumb.x, top: joystickThumb.y,
                    width: `${50 * finalScale}px`, height: `${50 * finalScale}px`,
                    transform: 'translate(-50%, -50%)' 
                  }}
                />
              </>
            )}
          </div>
        ) : (
          <div 
            className={`relative w-[160px] h-[160px] sm:w-[200px] sm:h-[200px] flex shrink-0 select-none items-center justify-center touch-none ${isEditingLayout ? 'ring-4 ring-green-500 cursor-move rounded-full' : ''}`}
            style={{ transform: `translate(${currentOffsets.left.x}px, ${currentOffsets.left.y}px) scale(${finalScale})`, transformOrigin: 'bottom left' }}
            onPointerDown={isEditingLayout ? handleDrag('left') : undefined}
          >
            <div className="relative w-32 h-32 flex items-center justify-center bg-gray-800 rounded-full shadow-[inset_0_5px_15px_rgba(0,0,0,0.8)] border-4 border-gray-700">
              <button 
                className="absolute top-0 w-10 h-12 bg-gray-400 rounded-t-lg active:bg-gray-500 active:scale-95 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] z-10"
                onPointerDown={handleStart('up')} onPointerUp={handleEnd('up')} onPointerLeave={handleEnd('up')}
              />
              <button 
                className="absolute bottom-0 w-10 h-12 bg-gray-400 rounded-b-lg active:bg-gray-500 active:scale-95 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] z-10"
                onPointerDown={handleStart('down')} onPointerUp={handleEnd('down')} onPointerLeave={handleEnd('down')}
              />
              <button 
                className="absolute left-0 w-12 h-10 bg-gray-400 rounded-l-lg active:bg-gray-500 active:scale-95 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] z-10"
                onPointerDown={handleStart('left')} onPointerUp={handleEnd('left')} onPointerLeave={handleEnd('left')}
              />
              <button 
                className="absolute right-0 w-12 h-10 bg-gray-400 rounded-r-lg active:bg-gray-500 active:scale-95 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] z-10"
                onPointerDown={handleStart('right')} onPointerUp={handleEnd('right')} onPointerLeave={handleEnd('right')}
              />
              <div className="absolute w-10 h-10 bg-gray-500 rounded-sm pointer-events-none"></div>
            </div>
          </div>
        )}
        {/* Визуализация джойстика */}
          {joystickCenter && joystickThumb && (
            <>
              {/* Основание стика */}
              <div 
                className="fixed bg-gray-800/90 border-4 border-gray-600 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] pointer-events-none z-50 backdrop-blur-sm"
                style={{ 
                  left: joystickCenter.x, top: joystickCenter.y, 
                  width: `${100 * finalScale}px`, height: `${100 * finalScale}px`,
                  transform: 'translate(-50%, -50%)' 
                }}
              />
              {/* Сам ползунок */}
              <div 
                className="fixed bg-gradient-to-b from-blue-400 to-blue-600 rounded-full border-2 border-blue-300 pointer-events-none z-50 shadow-lg shadow-blue-500/50"
                style={{ 
                  left: joystickThumb.x, top: joystickThumb.y,
                  width: `${50 * finalScale}px`, height: `${50 * finalScale}px`,
                  transform: 'translate(-50%, -50%)' 
                }}
              />
            </>
          )}
        {/* Экшн-кнопки */}
        <div 
          className={isEditingLayout ? 'ring-4 ring-green-500 cursor-move rounded-full touch-none p-4' : ''}
          style={{ transform: `translate(${currentOffsets.right.x}px, ${currentOffsets.right.y}px) scale(${finalScale})`, transformOrigin: 'bottom right' }}
          onPointerDown={isEditingLayout ? handleDrag('right') : undefined}
        >
          {renderActionButtons()}
        </div>

      </div>
    </div>
  );
};













