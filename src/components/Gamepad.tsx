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

  const handleStart = (btn: number) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    triggerVibration();
    onButtonDown(btn);
  };

  const handleEnd = (btn: number) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onButtonUp(btn);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 flex justify-between items-center" style={{ touchAction: 'none' }}>
      
      {/* Крестовина (слева) */}
      <div className="relative w-32 h-32 bg-gray-800 rounded-full opacity-50">
        <button 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-600 rounded-t-md active:bg-gray-500"
          onPointerDown={handleStart(Controller.BUTTON_UP)} 
          onPointerUp={handleEnd(Controller.BUTTON_UP)} 
          onPointerLeave={handleEnd(Controller.BUTTON_UP)}
        />
        <button 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-600 rounded-b-md active:bg-gray-500"
          onPointerDown={handleStart(Controller.BUTTON_DOWN)} 
          onPointerUp={handleEnd(Controller.BUTTON_DOWN)} 
          onPointerLeave={handleEnd(Controller.BUTTON_DOWN)}
        />
        <button 
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-600 rounded-l-md active:bg-gray-500"
          onPointerDown={handleStart(Controller.BUTTON_LEFT)} 
          onPointerUp={handleEnd(Controller.BUTTON_LEFT)} 
          onPointerLeave={handleEnd(Controller.BUTTON_LEFT)}
        />
        <button 
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-600 rounded-r-md active:bg-gray-500"
          onPointerDown={handleStart(Controller.BUTTON_RIGHT)} 
          onPointerUp={handleEnd(Controller.BUTTON_RIGHT)} 
          onPointerLeave={handleEnd(Controller.BUTTON_RIGHT)}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gray-600" />
      </div>

      {/* Кнопки A/B (справа) */}
      <div className="flex gap-6 items-end">
        <button 
          className="w-20 h-20 rounded-full bg-red-600 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 text-white font-bold text-2xl"
          onPointerDown={handleStart(Controller.BUTTON_B)} 
          onPointerUp={handleEnd(Controller.BUTTON_B)} 
          onPointerLeave={handleEnd(Controller.BUTTON_B)}
        >
          B
        </button>
        <button 
          className="w-20 h-20 rounded-full bg-red-600 border-b-4 border-red-800 active:border-b-0 active:translate-y-1 text-white font-bold text-2xl mb-6"
          onPointerDown={handleStart(Controller.BUTTON_A)} 
          onPointerUp={handleEnd(Controller.BUTTON_A)} 
          onPointerLeave={handleEnd(Controller.BUTTON_A)}
        >
          A
        </button>
      </div>
    </div>
  );
};