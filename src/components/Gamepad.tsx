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
    <div className="w-full max-w-3xl mx-auto px-4 flex justify-between items-center" style={{ touchAction: 'none' }}>
      
      {/* Крестовина (слева) */}
      <div className="relative w-40 h-40 bg-gray-800 rounded-full shadow-[inset_0_4px_15px_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.5)] border-4 border-gray-700 flex items-center justify-center">
        {/* Крестовина фон */}
        <div className="absolute w-12 h-28 bg-gray-900 rounded-sm shadow-[0_2px_10px_rgba(0,0,0,0.5)]" />
        <div className="absolute w-28 h-12 bg-gray-900 rounded-sm shadow-[0_2px_10px_rgba(0,0,0,0.5)]" />
        
        {/* Кнопки крестовины */}
        <button 
          className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-700 rounded-t-md shadow-[inset_0_2px_2px_rgba(255,255,255,0.2)] active:bg-gray-600 active:shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)]"
          onPointerDown={handleStart(Controller.BUTTON_UP)} 
          onPointerUp={handleEnd(Controller.BUTTON_UP)} 
          onPointerLeave={handleEnd(Controller.BUTTON_UP)}
        />
        <button 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-700 rounded-b-md shadow-[inset_0_-2px_2px_rgba(255,255,255,0.1)] active:bg-gray-600 active:shadow-[inset_0_-4px_8px_rgba(0,0,0,0.8)]"
          onPointerDown={handleStart(Controller.BUTTON_DOWN)} 
          onPointerUp={handleEnd(Controller.BUTTON_DOWN)} 
          onPointerLeave={handleEnd(Controller.BUTTON_DOWN)}
        />
        <button 
          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-700 rounded-l-md shadow-[inset_2px_0_2px_rgba(255,255,255,0.1)] active:bg-gray-600 active:shadow-[inset_4px_0_8px_rgba(0,0,0,0.8)]"
          onPointerDown={handleStart(Controller.BUTTON_LEFT)} 
          onPointerUp={handleEnd(Controller.BUTTON_LEFT)} 
          onPointerLeave={handleEnd(Controller.BUTTON_LEFT)}
        />
        <button 
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-gray-700 rounded-r-md shadow-[inset_-2px_0_2px_rgba(255,255,255,0.1)] active:bg-gray-600 active:shadow-[inset_-4px_0_8px_rgba(0,0,0,0.8)]"
          onPointerDown={handleStart(Controller.BUTTON_RIGHT)} 
          onPointerUp={handleEnd(Controller.BUTTON_RIGHT)} 
          onPointerLeave={handleEnd(Controller.BUTTON_RIGHT)}
        />
        {/* Центр крестовины */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gray-700 rounded-sm pointer-events-none flex items-center justify-center">
           <div className="w-6 h-6 rounded-full bg-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" />
        </div>
      </div>

      {/* Кнопки A/B (справа) */}
      <div className="flex gap-6 items-end pb-4 bg-gray-800 p-6 rounded-full shadow-[inset_0_4px_15px_rgba(0,0,0,0.8),0_4px_10px_rgba(0,0,0,0.5)] border-4 border-gray-700">
        <div className="flex flex-col items-center">
          <button 
            className="w-20 h-20 rounded-full bg-red-600 shadow-[inset_0_4px_4px_rgba(255,255,255,0.3),0_6px_0_#7f1d1d,0_10px_15px_rgba(0,0,0,0.5)] active:translate-y-[6px] active:shadow-[inset_0_2px_2px_rgba(255,255,255,0.1),0_0px_0_#7f1d1d,0_4px_5px_rgba(0,0,0,0.5)] text-white font-extrabold text-3xl transition-all"
            onPointerDown={handleStart(Controller.BUTTON_B)} 
            onPointerUp={handleEnd(Controller.BUTTON_B)} 
            onPointerLeave={handleEnd(Controller.BUTTON_B)}
          >
            B
          </button>
          <span className="text-gray-400 font-bold mt-4 text-lg">B</span>
        </div>
        <div className="flex flex-col items-center mb-6">
          <button 
            className="w-20 h-20 rounded-full bg-red-600 shadow-[inset_0_4px_4px_rgba(255,255,255,0.3),0_6px_0_#7f1d1d,0_10px_15px_rgba(0,0,0,0.5)] active:translate-y-[6px] active:shadow-[inset_0_2px_2px_rgba(255,255,255,0.1),0_0px_0_#7f1d1d,0_4px_5px_rgba(0,0,0,0.5)] text-white font-extrabold text-3xl transition-all"
            onPointerDown={handleStart(Controller.BUTTON_A)} 
            onPointerUp={handleEnd(Controller.BUTTON_A)} 
            onPointerLeave={handleEnd(Controller.BUTTON_A)}
          >
            A
          </button>
          <span className="text-gray-400 font-bold mt-4 text-lg">A</span>
        </div>
      </div>
    </div>
  );
};