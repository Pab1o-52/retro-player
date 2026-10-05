import React, { useRef } from 'react';
import { Controller } from 'jsnes';

interface GamepadProps {
  onButtonDown: (btn: number) => void;
  onButtonUp: (btn: number) => void;
}

export const Gamepad = ({ onButtonDown, onButtonUp }: GamepadProps) => {
  const activeDpadBtn = useRef<number | null>(null);

  const triggerVibration = () => {
    if (navigator.vibrate) navigator.vibrate(15); 
  };

  // Обработчики для кнопок A/B и Select/Start (без скольжения)
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

  // Обработчики скольжения для D-Pad (Крестовины)
  const handleDpadTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) {
      handleDpadTouchEnd(e);
      return;
    }

    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const btnAttr = element?.getAttribute('data-btn');
    const newBtn = btnAttr ? parseInt(btnAttr, 10) : null;

    if (newBtn !== activeDpadBtn.current) {
      if (activeDpadBtn.current !== null) {
        onButtonUp(activeDpadBtn.current);
      }
      if (newBtn !== null) {
        triggerVibration();
        onButtonDown(newBtn);
      }
      activeDpadBtn.current = newBtn;
    }
  };

  const handleDpadTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (activeDpadBtn.current !== null) {
      onButtonUp(activeDpadBtn.current);
      activeDpadBtn.current = null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 mt-auto" style={{ touchAction: 'none' }}>
      
      {/* Кнопки Select / Start (Отдельный блок сверху, по центру) */}
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

      {/* Крестовина и кнопки A/B (Нижний блок) */}
      <div className="flex flex-row justify-between items-end pb-8">
        
        {/* Крестовина (D-Pad) */}
        <div 
          className="relative w-[150px] h-[150px] sm:w-[160px] sm:h-[160px] bg-gray-800 rounded-full shadow-[inset_0_4px_15px_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.5)] border-4 border-gray-700 flex items-center justify-center shrink-0 select-none"
          onTouchStart={handleDpadTouch}
          onTouchMove={handleDpadTouch}
          onTouchEnd={handleDpadTouchEnd}
          onTouchCancel={handleDpadTouchEnd}
        >
          {/* Контейнер-Крест */}
          <div className="relative w-[120px] h-[120px]">
            {/* Вертикальная палка */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40px] h-[120px] bg-gray-900 rounded-md shadow-[0_2px_10px_rgba(0,0,0,0.5)] pointer-events-none" />
            {/* Горизонтальная палка */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[120px] h-[40px] bg-gray-900 rounded-md shadow-[0_2px_10px_rgba(0,0,0,0.5)] pointer-events-none" />
            
            {/* Невидимые или полупрозрачные зоны для Touch (Поверх креста) */}
            <div data-btn={Controller.BUTTON_UP} className="absolute top-0 left-1/2 -translate-x-1/2 w-[40px] h-[40px] bg-gray-700 rounded-t-md active:bg-gray-600 shadow-[inset_0_2px_2px_rgba(255,255,255,0.2)]" />
            <div data-btn={Controller.BUTTON_DOWN} className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40px] h-[40px] bg-gray-700 rounded-b-md active:bg-gray-600 shadow-[inset_0_-2px_2px_rgba(255,255,255,0.1)]" />
            <div data-btn={Controller.BUTTON_LEFT} className="absolute left-0 top-1/2 -translate-y-1/2 w-[40px] h-[40px] bg-gray-700 rounded-l-md active:bg-gray-600 shadow-[inset_2px_0_2px_rgba(255,255,255,0.1)]" />
            <div data-btn={Controller.BUTTON_RIGHT} className="absolute right-0 top-1/2 -translate-y-1/2 w-[40px] h-[40px] bg-gray-700 rounded-r-md active:bg-gray-600 shadow-[inset_-2px_0_2px_rgba(255,255,255,0.1)]" />
            
            {/* Центр */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40px] h-[40px] bg-gray-700 rounded-sm pointer-events-none flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Кнопки A/B (справа) */}
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