import re
with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = r'(className="w-full accent-blue-500"\s*/>\s*</div>)'
replacement = r'''\1
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-gray-300 font-medium">Тип крестовины:</label>
                <div className="flex gap-2">
                  {['analog', 'dpad'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setJoystickType(type as any)}
                      className={`flex-1 py-1 rounded font-bold transition-colors ${joystickType === type ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      {type === 'analog' ? 'Стик (Аналог)' : 'Классика (D-Pad)'}
                    </button>
                  ))}
                </div>
              </div>'''
code = re.sub(target, replacement, code)

with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
