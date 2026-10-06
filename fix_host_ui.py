import re
with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target1 = '''                    {netplayStatus === 'Connected' && netplayManager.role === 'host' && (
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
                    )}'''
replacement1 = ''
code = code.replace(target1, replacement1)

target2 = '''        netplayManager.onConnectionStatus = async (status) => {
          setNetplayStatus(status);
          if (status === 'Connected' && activeGameId) {'''
replacement2 = '''        netplayManager.onConnectionStatus = async (status) => {
          setNetplayStatus(status);
          if (status === 'Connected' && activeGameId) {
            setIsSettingsOpen(false); // Auto-close settings for Host when P2 joins'''
code = code.replace(target2, replacement2)

with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
