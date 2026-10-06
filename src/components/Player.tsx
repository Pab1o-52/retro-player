import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { Gamepad } from './Gamepad';
import { Nostalgist } from 'nostalgist';
import { netplayManager } from '../lib/multiplayer/NetplayManager';

export const Player = () => {
  const { games, activeGameId, getRomBuffer, stopGame, saveGameState, loadGameState, joystickScale, setJoystickScale, buttonLayout, setButtonLayout, netplayStatus, setNetplayStatus } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nostalgistRef = useRef<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [debugLog, setDebugLog] = useState<string>('');
  const [inviteId, setInviteId] = useState<string>('');

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
              pause_nonactive: false,
            input_libretro_device_p1: 1,
            input_libretro_device_p2: 1,
            input_player2_joypad_index: 1,
            input_player2_start: 'num1',
            input_player2_select: 'num2',
            input_player2_a: 'num3',
            input_player2_b: 'num4',
            input_player2_x: 'num5',
            input_player2_y: 'num6',
            input_player2_l: 'num7',
            input_player2_r: 'num8',
            input_player2_up: 'w',
            input_player2_down: 's',
            input_player2_left: 'a',
            input_player2_right: 'd',
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
          const buffer = await getRomBuffer(activeGameId);
          if (buffer) {
            netplayManager.sendRom(activeGame!.title, activeGame!.system, new ArrayBuffer(0)); // Empty buffer for cloud gaming
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
      
      <div className="w-full max-w-3xl mx-auto flex justify-between items-center mb-4 px-2">
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow"
        >
          ⚙️ Настройки {netplayStatus === 'Connected' && <span className="text-green-500 ml-1">● P2</span>}
        </button>
        <button 
          onClick={() => {
            netplayManager.disconnect();
            stopGame();
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow"
        >
          Выйти
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

            <div className="grid grid-cols-2 gap-4">
               <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-md">
                 💾 Сохранить
               </button>
               <button onClick={handleLoad} className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-md">
                 📂 Загрузить
               </button>
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
    </div>
  );
};

