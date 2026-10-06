import re
with open('src/components/Player.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target = '    const handleButtonUp = (btn: string) => {'

replacement = '''    useEffect(() => {
      if (netplayManager.role !== 'client') return; // Host already has native keyboard support via Nostalgist

      const keyMap: Record<string, string> = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'KeyZ': 'a',
        'KeyX': 'b',
        'KeyC': 'c',
        'KeyA': 'x',
        'KeyS': 'y',
        'KeyD': 'z',
        'Enter': 'start',
        'ShiftRight': 'select',
        'ShiftLeft': 'select',
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (document.activeElement?.tagName === 'INPUT') return;
        const btn = keyMap[e.code];
        if (btn) {
          e.preventDefault();
          handleButtonDown(btn);
        }
      };

      const onKeyUp = (e: KeyboardEvent) => {
        if (document.activeElement?.tagName === 'INPUT') return;
        const btn = keyMap[e.code];
        if (btn) {
          e.preventDefault();
          handleButtonUp(btn);
        }
      };

      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      return () => {
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
      };
    }, [activeGame, netplayManager.role]);

    const handleButtonUp = (btn: string) => {'''

code = code.replace(target, replacement)
with open('src/components/Player.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
