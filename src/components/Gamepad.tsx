import React, { useRef, useState } from 'react';
import { Controller } from 'jsnes';

interface GamepadProps {
  onButtonDown: (btn: number) => void;
  onButtonUp: (btn: number) => void;
}

interface Point {
  x: number;
  y: number;
}

export const Gamepad = ({ onButtonDown, onButtonUp }: GamepadProps) => {
  const [joystickCenter, setJoystickCenter] = useState<Point | null>(null);
  const [joystickThumb, setJoystickThumb] = useState<Point | null>(null);
  
  // Храним активные кнопки крестовины, чтобы отпускать их
  const activeBtns = useRef<Set<number>>(new Set());

  const triggerVibration = () => {
    if (navigator.vibrate) navigator.vibrate(15); 
  };

  const handleStart = (btn: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    try { (e.target as HTMLElement).setPointerCapture(e.pointerId); } catch (err) {}
    triggerVibration();
    onButtonDown(btn);
  };

  const handleEnd = (btn: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch (err) {}
    onButtonUp(btn);
  };

  // --- ЛОГИКА ПЛАВАЮЩЕГО ДЖОЙСТИКА ---
  const handleJoystickStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const point = { x: touch.clientX, y: touch.clientY };
    setJoystickCenter(point);
    setJoystickThumb(point);
    triggerVibration();
  };

  const handleJoystickMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!joystickCenter) return;
    
    const touch = e.touches[0];
    const dx = touch.clientX - joystickCenter.x;
    const dy = touch.clientY - joystickCenter.y;
    
    // Ограничиваем радиус стика визуально (например, 50px)
    const maxRadius = 50;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    let thumbX = touch.clientX;
    let thumbY = touch.clientY;

    if (distance > maxRadius) {
      const angle = Math.atan2(dy, dx);
      thumbX = joystickCenter.x + Math.cos(angle) * maxRadius;
      thumbY = joystickCenter.y + Math.sin(angle) * maxRadius;
    }
    
    setJoystickThumb({ x: thumbX, y: thumbY });

    // Вычисляем зажатые кнопки (мертвая зона 15px)
    const deadzone = 15;
    const newActive = new Set<number>();

    if (distance > deadzone) {
      // Можно нажимать диагонали (например, влево + вверх)
      if (dx < -deadzone) newActive.add(Controller.BUTTON_LEFT);
      if (dx > deadzone) newActive.add(Controller.BUTTON_RIGHT);
      if (dy < -deadzone) newActive.add(Controller.BUTTON_UP);
      if (dy > deadzone) newActive.add(Controller.BUTTON_DOWN);
    }

    // Отпускаем старые, нажимаем новые
    activeBtns.current.forEach(btn => {
      if (!newActive.has(btn)) onButtonUp(btn);
    });
    newActive.forEach(btn => {
      if (!activeBtns.current.has(btn)) onButtonDown(btn);
    });

    activeBtns.current = newActive;
  };

  const handleJoystickEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setJoystickCenter(null);
    setJoystickThumb(null);
    
    activeBtns.current.forEach(btn => onButtonUp(btn));
    activeBtns.current.clear();
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 mt-auto" style={{ touchAction: 'none' }}>
      
      {/* Кнопки Select / Start */}
      <div className="flex gap-6 justify-center shrink-0">
        <div className="flex flex-col items-center">
          <button 
            className="w-16 h-6 bg-gray-900 rounded-full border-2 border-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_2px_0_rgba(255,255,255,0.1)] active:translate-y-1 active:shadow-[inset_0_4px_6px_rgba(0,0,0,0.9)] transition-all"
            onPointerDown={handleStart(Controller.BUTTON_SELECT)} 
            onPointerUp={handleEnd(Controller.BUTTON_SELECT)} 
            onPointerLeave={handleEnd(Controller.BUTTON_SELECT)}
          />
          <span className="text-gray-400 font-bold mt-1 text-xs uppercase tracking-widest">Select</span>
        </div>
        <div className="flex flex-col items-center">
          <button 
            className="w-16 h-6 bg-gray-900 rounded-full border-2 border-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_2px_0_rgba(255,255,255,0.1)] active:translate-y-1 active:shadow-[inset_0_4px_6px_rgba(0,0,0,0.9)] transition-all"
            onPointerDown={handleStart(Controller.BUTTON_START)} 
            onPointerUp={handleEnd(Controller.BUTTON_START)} 
            onPointerLeave={handleEnd(Controller.BUTTON_START)}
          />
          <span className="text-gray-400 font-bold mt-1 text-xs uppercase tracking-widest">Start</span>
        </div>
      </div>

      <div className="flex flex-row justify-between items-end pb-8">
        
        {/* Зона плавающего джойстика */}
        <div 
          className="relative w-1/2 h-[200px] flex items-center justify-center shrink-0 select-none border-2 border-dashed border-gray-700/30 rounded-3xl"
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
          onTouchCancel={handleJoystickEnd}
        >
          <span className="text-gray-600/50 font-bold text-center pointer-events-none px-4">
            Зона плавающего<br/>джойстика (Тап и тяни)
          </span>

          {/* Визуализация джойстика */}
          {joystickCenter && joystickThumb && (
            <>
              {/* Основание стика */}
              <div 
                className="fixed bg-gray-800/80 border-2 border-gray-500 rounded-full w-[100px] h-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 backdrop-blur-sm"
                style={{ left: joystickCenter.x, top: joystickCenter.y }}
              />
              {/* Сам ползунок */}
              <div 
                className="fixed bg-blue-500 rounded-full w-[50px] h-[50px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 shadow-lg shadow-blue-500/50"
                style={{ left: joystickThumb.x, top: joystickThumb.y }}
              />
            </>
          )}
        </div>

        {/* Кнопки A/B */}
        <div className="flex gap-4 sm:gap-6 items-end pb-2 sm:pb-4 bg-gray-800 p-4 sm:p-6 rounded-full shadow-[inset_0_4px_15px_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.5)] border-4 border-gray-700 shrink-0">
          <div className="flex flex-col items-center">
            <button 
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-red-600 shadow-[inset_0_4px_4px_rgba(255,255,255,0.3),0_6px_0_#7f1d1d,0_10px_15px_rgba(0,0,0,0.5)] active:translate-y-[6px] active:shadow-[inset_0_2px_2px_rgba(255,255,255,0.1),0_0px_0_#7f1d1d,0_4px_5px_rgba(0,0,0,0.5)] text-white font-extrabold text-xl sm:text-3xl transition-all flex items-center justify-center"
              onPointerDown={handleStart(Controller.BUTTON_B)} 
              onPointerUp={handleEnd(Controller.BUTTON_B)} 
              onPointerLeave={handleEnd(Controller.BUTTON_B)}
            >
              B
            </button>
          </div>
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <button 
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-red-600 shadow-[inset_0_4px_4px_rgba(255,255,255,0.3),0_6px_0_#7f1d1d,0_10px_15px_rgba(0,0,0,0.5)] active:translate-y-[6px] active:shadow-[inset_0_2px_2px_rgba(255,255,255,0.1),0_0px_0_#7f1d1d,0_4px_5px_rgba(0,0,0,0.5)] text-white font-extrabold text-xl sm:text-3xl transition-all flex items-center justify-center"
              onPointerDown={handleStart(Controller.BUTTON_A)} 
              onPointerUp={handleEnd(Controller.BUTTON_A)} 
              onPointerLeave={handleEnd(Controller.BUTTON_A)}
            >
              A
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};