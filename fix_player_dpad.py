import re
with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target1 = '''const { games, activeGameId, getRomBuffer, stopGame, saveGameState, loadGameState, joystickScale, setJoystickScale, buttonLayout, setButtonLayout, netplayStatus, setNetplayStatus } = useStore();'''
replacement1 = '''const { games, activeGameId, getRomBuffer, stopGame, saveGameState, loadGameState, joystickScale, setJoystickScale, buttonLayout, setButtonLayout, joystickType, setJoystickType, netplayStatus, setNetplayStatus } = useStore();'''
code = code.replace(target1, replacement1)

target2 = '''                  <input 
                    type="range" 
                    min="0.5" max="2" step="0.1" 
                    value={joystickScale} 
                    onChange={e => setJoystickScale(parseFloat(e.target.value))} 
                    className="w-full"
                  />
                </div>'''
replacement2 = '''                  <input 
                    type="range" 
                    min="0.5" max="2" step="0.1" 
                    value={joystickScale} 
                    onChange={e => setJoystickScale(parseFloat(e.target.value))} 
                    className="w-full"
                  />
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm">Тип крестовины:</span>
                  </div>
                  <div className="flex gap-2">
                    {['analog', 'dpad'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setJoystickType(type as any)}
                        className={`flex-1 py-1 rounded text-sm font-bold ${joystickType === type ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                      >
                        {type === 'analog' ? 'Аналог' : 'Крестик'}
                      </button>
                    ))}
                  </div>
                </div>'''
code = code.replace(target2, replacement2)

with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
