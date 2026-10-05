import React from 'react';
import { Controller } from 'jsnes';

interface GamepadProps {
  onButtonDown: (btn: number) => void;
  onButtonUp: (btn: number) => void;
}

export const Gamepad = ({ onButtonDown, onButtonUp }: GamepadProps) => {
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

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-row justify-between items-end pb-8 mt-auto" style={{ touchAction: 'none' }}>
      
      {/* Крестовина (слева) */}
      <div className="relative w-[150px] h-[150px] sm:w-[160px] sm:h-[160px] bg-gray-800 rounded-full shadow-[inset_0_4px_15px_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.5)] border-4 border-gray-700 flex items-center justify-center shrink-0">
        {/* Крестовина фон */}
        <div className="absolute w-[40px] h-[120px] bg-gray-900 rounded-sm shadow-[0_2px_10px_rgba(0,0,0,0.5)]" />
        <div className="absolute w-[120px] h-[40px] bg-gray-900 rounded-sm shadow-[0_2px_10px_rgba(0,0,0,0.5)]" />
        
        {/* Кнопки крестовины */}
        <button 
          className="absolute top-[15px] sm:top-[20px] left-1/2 -translate-x-1/2 w-[40px] h-[40px] bg-gray-700 rounded-t-md shadow-[inset_0_2px_2px_rgba(255,255,255,0.2)] active:bg-gray-600 active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]"
          onPointerDown={handleStart(Controller.BUTTON_UP)} 
          onPointerUp={handleEnd(Controller.BUTTON_UP)} 
          onPointerLeave={handleEnd(Controller.BUTTON_UP)}
        />
        <button 
          className="absolute bottom-[15px] sm:bottom-[20px] left-1/2 -translate-x-1/2 w-[40px] h-[40px] bg-gray-700 rounded-b-md shadow-[inset_0_-2px_2px_rgba(255,255,255,0.1)] active:bg-gray-600 active:shadow-[inset_0_-4px_8px_rgba(0,0,0,0.8)]"
          onPointerDown={handleStart(Controller.BUTTON_DOWN)} 
          onPointerUp={handleEnd(Controller.BUTTON_DOWN)} 
          onPointerLeave={handleEnd(Controller.BUTTON_DOWN)}
        />
        <button 
          className="absolute left-[15px] sm:left-[20px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] bg-gray-700 rounded-l-md shadow-[inset_2px_0_2px_rgba(255,255,255,0.1)] active:bg-gray-600 active:shadow-[inset_4px_0_8px_rgba(0,0,0,0.8)]"
          onPointerDown={handleStart(Controller.BUTTON_LEFT)} 
          onPointerUp={handleEnd(Controller.BUTTON_LEFT)} 
          onPointerLeave={handleEnd(Controller.BUTTON_LEFT)}
        />
        <button 
          className="absolute right-[15px] sm:right-[20px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] bg-gray-700 rounded-r-md shadow-[inset_-2px_0_2px_rgba(255,255,255,0.1)] active:bg-gray-600 active:shadow-[inset_-4px_0_8px_rgba(0,0,0,0.8)]"
          onPointerDown={handleStart(Controller.BUTTON_RIGHT)} 
          onPointerUp={handleEnd(Controller.BUTTON_RIGHT)} 
          onPointerLeave={handleEnd(Controller.BUTTON_RIGHT)}
        />
        {/* Центр крестовины */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40px] h-[40px] bg-gray-700 rounded-sm pointer-events-none flex items-center justify-center">
           <div className="w-6 h-6 rounded-full bg-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
        </div>
      </div>

      {/* Кнопки Select / Start (По центру снизу) */}
      <div className="flex gap-2 sm:gap-4 items-end pb-2 shrink-0">
        <div className="flex flex-col items-center">
          <button 
            className="w-12 h-5 sm:w-16 sm:h-6 bg-gray-900 rounded-full border-2 border-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_2px_0_rgba(255,255,255,0.1)] active:translate-y-1 active:shadow-[inset_0_4px_6px_rgba(0,0,0,0.9)] transition-all"
            onPointerDown={handleStart(Controller.BUTTON_SELECT)} 
            onPointerUp={handleEnd(Controller.BUTTON_SELECT)} 
            onPointerLeave={handleEnd(Controller.BUTTON_SELECT)}
          />
          <span className="text-gray-400 font-bold mt-1 text-[10px] sm:text-xs uppercase tracking-widest">Select</span>
        </div>
        <div className="flex flex-col items-center">
          <button 
            className="w-12 h-5 sm:w-16 sm:h-6 bg-gray-900 rounded-full border-2 border-gray-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_2px_0_rgba(255,255,255,0.1)] active:translate-y-1 active:shadow-[inset_0_4px_6px_rgba(0,0,0,0.9)] transition-all"
            onPointerDown={handleStart(Controller.BUTTON_START)} 
            onPointerUp={handleEnd(Controller.BUTTON_START)} 
            onPointerLeave={handleEnd(Controller.BUTTON_START)}
          />
          <span className="text-gray-400 font-bold mt-1 text-[10px] sm:text-xs uppercase tracking-widest">Start</span>
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
  );
};