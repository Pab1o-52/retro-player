import re
with open('src/components/Catalog.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

target1 = '''  useEffect(() => {
    if (games.length === 0) setIsHintOpen(true);
  }, [games.length]);'''
replacement1 = '''  useEffect(() => {
    if (games.length === 0) setIsHintOpen(true);
    else setIsHintOpen(false);
  }, [games.length]);'''
code = code.replace(target1, replacement1)

target2 = '''  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-8 max-w-7xl mx-auto">'''
replacement2 = '''  return (
    <div className="min-h-full p-4 sm:p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-indigo-900/30 to-black relative overflow-hidden">
      {/* 3D background effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-50 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative flex justify-between items-center mb-8 max-w-7xl mx-auto">'''
code = code.replace(target2, replacement2)

# Fix missing closing relative wrapper for the content, actually we don't need to wrap all, but let's make sure elements are relative
target3 = '''      <div className="max-w-7xl mx-auto mb-8">'''
replacement3 = '''      <div className="relative max-w-7xl mx-auto mb-8">'''
code = code.replace(target3, replacement3)

target4 = '''      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 p-2 max-w-7xl mx-auto">'''
replacement4 = '''      <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 p-2 max-w-7xl mx-auto">'''
code = code.replace(target4, replacement4)

with open('src/components/Catalog.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
