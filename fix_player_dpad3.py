import re
with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = r'(<label className="text-gray-300 font-medium">Раскладка кнопок:</label>)'
replacement = r'''<div className="flex flex-col gap-2 mt-4 mb-4">
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
              \1'''
code = re.sub(target, replacement, code)

with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
