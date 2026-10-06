import re
with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target2 = r"netplayManager\.onConnectionStatus = async \(status\) => \{\s*setNetplayStatus\(status\);\s*if \(status === 'Connected' && activeGameId\) \{"
replacement2 = '''netplayManager.onConnectionStatus = async (status) => {
          setNetplayStatus(status);
          if (status === 'Connected' && activeGameId) {
            setIsSettingsOpen(false); // Auto-close settings for Host when P2 joins'''
code = re.sub(target2, replacement2, code)

with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
