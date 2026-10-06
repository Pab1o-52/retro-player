import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { Gamepad } from './Gamepad';
import { Nostalgist } from 'nostalgist';
import { netplayManager } from '../lib/multiplayer/NetplayManager';

// Force Emscripten to always accept keyboard events even if window loses focus
try {
  Object.defineProperty(document, 'hasFocus', { get: () => () => true });
} catch (e) {}

export const Player = () => {
  const { games, activeGameId, getRomBuffer, stopGame, saveGameState, loadGameState, joystickScale, setJoystickScale, buttonLayout, setButtonLayout, joystickType, setJoystickType, netplayStatus, setNetplayStatus, keyBinds, setKeyBinds } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nostalgistRef = useRef<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isKeyboardSettingsOpen, setIsKeyboardSettingsOpen] = useState(false);
  const [debugLog, setDebugLog] = useState<string>('');
  const [inviteId, setInviteId] = useState<string>('');
  const [mappingBtn, setMappingBtn] = useState<string | null>(null);

  useEffect(() => {
    if (!mappingBtn) return;
    const handleMapKey = (e: KeyboardEvent) => {
      e.preventDefault();
      setKeyBinds({ ...keyBinds, [mappingBtn]: e.code });
      setMappingBtn(null);
    };
    window.addEventListener('keydown', handleMapKey, { once: true });
    return () => window.removeEventListener('keydown', handleMapKey);
  }, [mappingBtn, keyBinds]);

  // Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Prevent spamming
      const entry = Object.entries(keyBinds).find(([_btn, code]) => code === e.code);
      if (entry) {
        e.preventDefault(); // Prevent scrolling with arrow keys
        handleButtonDown(entry[0]);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      const entry = Object.entries(keyBinds).find(([_btn, code]) => code === e.code);
      if (entry) {
        e.preventDefault();
        handleButtonUp(entry[0]);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keyBinds, activeGameId]);

  const activeGame = games.find(g => g.id === activeGameId);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!activeGameId || !activeGame) return;
    
    let isCancelled = false;

    if (netplayManager.role === 'client') {
      setDebugLog('Ожидание трансляции от Хоста...');
      netplayManager.sendReady();
      return;
    }

    if (!canvasRef.current) return;
    setDebugLog('Loading Emulator Core (WASM)...');

    getRomBuffer(activeGameId).then(async (buffer) => {
      if (isCancelled || !buffer) return;
      
      try {
        const coreName = activeGame.system === 'sega' ? 'genesis_plus_gx' : 'fceumm';
        
        const nostalgist = await Nostalgist.launch({
          core: coreName,
          rom: buffer,
          element: canvasRef.current!,
          retroarchConfig: {
            input_libretro_device_p1: 1,
            input_libretro_device_p2: 1,
            input_player2_joypad_index: 1,
            pause_nonactive: false,
            input_player2_start: 'u',
            input_player2_select: 'i',
            input_player2_a: 'j',
            input_player2_b: 'k',
            input_player2_x: 'l',
            input_player2_y: 'm',
            input_player2_l: 'n',
            input_player2_r: 'o',
            input_player2_up: 't',
            input_player2_down: 'g',
            input_player2_left: 'f',
            input_player2_right: 'h',
            
            // P1 Keyboard Map (ZXC = ABC, ASD = XYZ)
            input_player1_y: 'z', // Sega A
            input_player1_b: 'x', // Sega B
            input_player1_a: 'c', // Sega C
            input_player1_l: 'a', // Sega X
            input_player1_x: 's', // Sega Y
            input_player1_r: 'd', // Sega Z
            input_player1_start: 'enter',
            input_player1_select: 'shift',
            input_player1_up: 'up',
            input_player1_down: 'down',
            input_player1_left: 'left',
            input_player1_right: 'right',
          }
        });

        if (isCancelled) {
          nostalgist.exit();
          return;
        }

        nostalgistRef.current = nostalgist;
        setDebugLog('');
      } catch (err: any) {
        setDebugLog('Core Crash: ' + err.message);
      }
    });

    return () => {
      isCancelled = true;
      if (nostalgistRef.current) {
        nostalgistRef.current.exit();
        nostalgistRef.current = null;
      }
    };
  }, [activeGameId, activeGame]);

  useEffect(() => {
    netplayManager.onConnectionStatus = (status) => {
      setNetplayStatus(status);
      setDebugLog('Netplay: ' + status);
      setTimeout(() => setDebugLog(''), 3000);
    };

    netplayManager.onInputReceived = (btn, isDown) => {
      if (!nostalgistRef.current) return;
      // We map the button to the system
      const mapped = mapButton(btn, activeGame?.system);
      const playerIndex = netplayManager.role === 'host' ? 2 : 1; // if host, input is from p2. if client, input is from p1.
      if (netplayManager.role === 'host') setDebugLog(`P2: ${btn} ${isDown ? "DOWN" : "UP"}`);
        if (isDown) nostalgistRef.current.pressDown({ button: mapped, player: playerIndex });
      else nostalgistRef.current.pressUp({ button: mapped, player: playerIndex });
    };

    netplayManager.onClientReady = async () => {
      // Send ONE initial save state to sync up the client
      if (netplayManager.role === 'host' && nostalgistRef.current) {
        try {
          const state = await nostalgistRef.current.saveState();
          const buffer = await state.state.arrayBuffer();
          netplayManager.sendSync(buffer);
        } catch (e) {
          console.error('Failed to send initial sync', e);
        }
      }
    };

    netplayManager.onVideoStream = (stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setDebugLog('');
      }
    };
    if (netplayManager.cachedStream) {
      netplayManager.onVideoStream(netplayManager.cachedStream);
    }
  }, [activeGame]);

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const handleSave = async () => {
    if (nostalgistRef.current && activeGameId) {
      const state = await nostalgistRef.current.saveState();
      // Nostalgist saveState returns a Blob, which we can save to IndexedDB
      await saveGameState(activeGameId, state);
      setIsSettingsOpen(false);
      setDebugLog('Сохранено!');
      setTimeout(() => setDebugLog(''), 2000);
    }
  };

  const handleLoad = async () => {
    if (nostalgistRef.current && activeGameId) {
      const stateBlob = await loadGameState(activeGameId);
      if (stateBlob) {
        await nostalgistRef.current.loadState(stateBlob.state); // nostalgist api
        setIsSettingsOpen(false);
        setDebugLog('Загружено!');
        setTimeout(() => setDebugLog(''), 2000);
      } else {
        setDebugLog('Нет сохранений!');
        setTimeout(() => setDebugLog(''), 2000);
      }
    }
  };

  const mapButton = (btn: string, system: string | undefined): string => {
    if (system === 'sega') {
      switch (btn) {
        case 'a': return 'y'; // Sega A -> RetroPad Y
        case 'b': return 'b'; // Sega B -> RetroPad B
        case 'c': return 'a'; // Sega C -> RetroPad A
        case 'x': return 'l'; // Sega X -> RetroPad L
        case 'y': return 'x'; // Sega Y -> RetroPad X
        case 'z': return 'r'; // Sega Z -> RetroPad R
        default: return btn;
      }
    }
    return btn;
  };

  const handleButtonDown = (btn: string) => {
    if (nostalgistRef.current) {
      const mapped = mapButton(btn, activeGame?.system);
      const playerIndex = netplayManager.role === 'client' ? 2 : 1;
      nostalgistRef.current.pressDown({ button: mapped, player: playerIndex });
    }
    netplayManager.sendInput(btn, true);
  };
  
  const handleButtonUp = (btn: string) => {
    if (nostalgistRef.current) {
      const mapped = mapButton(btn, activeGame?.system);
      const playerIndex = netplayManager.role === 'client' ? 2 : 1;
      nostalgistRef.current.pressUp({ button: mapped, player: playerIndex });
    }
    netplayManager.sendInput(btn, false);
  };

  const handleHostGame = async () => {
    try {
      setDebugLog('Generating Invite...');
      const id = await netplayManager.hostGame();
      setInviteId(id);
      setDebugLog('Waiting for P2...');
      
      // When client connects, send ROM
      netplayManager.onConnectionStatus = async (status) => {
          setNetplayStatus(status);
          if (status === 'Connected' && activeGameId) {
            setIsSettingsOpen(false); // Auto-close settings for Host when P2 joins
          const buffer = await getRomBuffer(activeGameId);
          if (buffer) {
            netplayManager.sendRom(activeGame!.title, activeGame!.system, buffer); // Send actual ROM so client saves it
            setDebugLog('Sending ROM...');
          }
            const stream = (canvasRef.current as any)?.captureStream(30);
            if (stream) {
              netplayManager.sendStream(stream);
            }
        }
      };
    } catch (e: any) {
      console.error(e);
      setDebugLog('Error: ' + String(e.type || e.message || e));
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col justify-between p-4 touch-none h-[100dvh]">
      
      <div className="w-full max-w-3xl mx-auto flex justify-between items-center mb-4 px-2 gap-2">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-xl transition-colors shadow flex items-center justify-center"
        >
          ⚙️ {netplayStatus === 'Connected' && <span className="text-green-500 ml-1 text-sm">●</span>}
        </button>

        <div className="flex gap-2 flex-1 justify-center">
          <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xl shadow flex items-center justify-center">
            💾
          </button>
          <button onClick={handleLoad} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xl shadow flex items-center justify-center">
            📂
          </button>
        </div>

        <button 
          onClick={() => {
            netplayManager.disconnect();
            stopGame();
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xl transition-colors shadow flex items-center justify-center"
        >
          ❌
        </button>
      </div>

      <div className="relative w-full max-w-3xl mx-auto aspect-[256/240] bg-black border-4 md:border-[12px] border-gray-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(0,0,0,1)] mb-2 sm:mb-8 flex justify-center items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-10" />
        
        <canvas 
          ref={canvasRef} 
          className="w-full h-full object-contain relative z-0"
          style={{ imageRendering: 'pixelated', display: netplayManager.role === 'client' ? 'none' : 'block' }}
        />
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain relative z-0"
          style={{ display: netplayManager.role === 'client' ? 'block' : 'none' }}
        />

        {debugLog && (
          <div className="absolute top-4 left-4 z-30 p-2 bg-black/80 rounded border border-green-500/30 shadow-lg">
            <span className="text-green-500 font-mono text-sm font-bold uppercase tracking-widest drop-shadow-md">
              {debugLog}
            </span>
          </div>
        )}
      </div>

      <Gamepad 
        onButtonDown={handleButtonDown}
        onButtonUp={handleButtonUp}
        scale={joystickScale}
        layout={buttonLayout}
      />

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-2">Настройки</h2>
            
            <div className="bg-gray-900 border border-blue-500/50 p-4 rounded-lg flex flex-col gap-2">
              <h3 className="text-blue-400 font-bold">🌐 Мультиплеер (P2P)</h3>
              {inviteId ? (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Отправь эту ссылку другу (или ID):</p>
                  <input 
                    readOnly 
                    value={`${window.location.origin}${window.location.pathname}?join=${inviteId}`}
                    className="w-full bg-black border border-gray-700 text-green-400 p-2 rounded text-xs mb-2"
                    onClick={e => (e.target as HTMLInputElement).select()}
                  />
                  <div className="text-xs text-center text-gray-500 mb-2">
                    Статус: {netplayStatus || 'Ожидание P2...'}
                  </div>
                  {netplayStatus === 'Connected' && netplayManager.role === 'host' && (
                    <button 
                      onClick={async () => {
                        if (nostalgistRef.current) {
                          setDebugLog('Синхронизация...');
                          const state = await nostalgistRef.current.saveState();
                          const buffer = await state.state.arrayBuffer();
                          netplayManager.sendSync(buffer);
                          setIsSettingsOpen(false);
                          setTimeout(() => setDebugLog(''), 2000);
                        }
                      }}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded font-bold w-full text-sm"
                    >
                      🔄 Синхронизировать игру
                    </button>
                  )}
                </div>
              ) : (
                <button 
                  onClick={handleHostGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-bold w-full"
                >
                  👥 Пригласить друга
                </button>
              )}
            </div>

            <div className="w-full h-px bg-gray-700 my-2"></div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium">Размер джойстика: {Math.round(joystickScale * 100)}%</label>
              <input 
                type="range" 
                min="0.5" max="2" step="0.1" 
                value={joystickScale} 
                onChange={(e) => setJoystickScale(parseFloat(e.target.value))}
                className="w-full accent-blue-500" 
              />
            </div>


            <div className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium">Количество кнопок</label>
              <div className="flex flex-col gap-2 mt-4 mb-4">
                <label className="text-gray-300 font-medium">Тип крестовины (Движение):</label>
                <div className="flex gap-2">
                  {['analog', 'dpad'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setJoystickType(type as any)}
                      className={`flex-1 py-1 rounded font-bold transition-colors ${joystickType === type ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      {type === 'analog' ? 'Аналог (Стик)' : 'Классика (Крестик)'}
                    </button>
                  ))}
                </div>
              </div>
              <select 
                value={buttonLayout}
                onChange={(e) => setButtonLayout(parseInt(e.target.value) as 2|3|4|6)}
                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none focus:border-blue-500"
              >
                <option value={2}>2 кнопки (A, B)</option>
                <option value={3}>3 кнопки (A, B, C)</option>
                <option value={4}>4 кнопки (A, B, X, Y)</option>
                <option value={6}>6 кнопок (A, B, C, X, Y, Z)</option>
              </select>
            </div>

            <div className="w-full h-px bg-gray-700 my-2"></div>
            
            <button 
              onClick={() => { setIsSettingsOpen(false); setIsKeyboardSettingsOpen(true); }}
              className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold shadow-md w-full"
            >
              ⌨️ Настроить клавиатуру
            </button>

            <div className="w-full h-px bg-gray-700 my-2"></div>

            <button 
              onClick={handleFullScreen}
              className="bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-colors"
            >
              🖥 Full Screen
            </button>

            <button 
              onClick={() => setIsSettingsOpen(false)}
              className="bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold transition-colors mt-2"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {isKeyboardSettingsOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
            <h2 className="text-xl font-bold text-white text-center mb-2 flex items-center justify-center gap-2">
              ⌨️ Настройка клавиатуры
            </h2>
            <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {Object.entries(keyBinds).map(([btn, code]) => (
                <button
                  key={btn}
                  onClick={() => setMappingBtn(btn)}
                  className={`flex justify-between items-center px-3 py-3 rounded border text-sm transition-colors ${mappingBtn === btn ? 'bg-blue-600 border-blue-400 text-white animate-pulse' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'}`}
                >
                  <span className="uppercase font-bold">{btn}</span>
                  <span className="text-gray-100 font-mono text-xs">{mappingBtn === btn ? 'НАЖМИТЕ...' : code.replace('Key', '').replace('Arrow', '')}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => { setIsKeyboardSettingsOpen(false); setIsSettingsOpen(true); }}
              className="bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold transition-colors mt-2 w-full"
            >
              Назад в настройки
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

