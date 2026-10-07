import { useState, useEffect } from 'react';

const COLLECTIONS = [
  { id: 'No-Intro_NES', name: 'NES (Dendy)', system: 'nes' },
  { id: 'ef_nintendo_snes_no-intro_2024-04-20', name: 'Super Nintendo', system: 'snes' }
];

interface ArchiveFile {
  name: string;
  size: string;
}

export const ArchiveBrowser = ({ onDownload, onClose }: { onDownload: (file: File, system: string) => void, onClose: () => void }) => {
  const [collection, setCollection] = useState(COLLECTIONS[0]);
  const [files, setFiles] = useState<ArchiveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setFiles([]);
    fetch(`https://archive.org/metadata/${collection.id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.files) {
          const valid = data.files.filter((f: any) => f.name.endsWith('.zip') || f.name.endsWith('.nes') || f.name.endsWith('.sfc') || f.name.endsWith('.md'));
          setFiles(valid);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [collection]);

  const handleDownload = async (file: ArchiveFile) => {
    try {
      setDownloading(file.name);
      // Use cors.archive.org for better CORS support
      const url = `https://cors.archive.org/cors/${collection.id}/${encodeURIComponent(file.name)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();
      const newFile = new File([blob], file.name);
      onDownload(newFile, collection.system);
    } catch (e) {
      console.error(e);
      alert("Ошибка скачивания. Возможно архив недоступен из-за CORS или блокировки.");
    } finally {
      setDownloading(null);
    }
  };

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).slice(0, 50);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex flex-col p-4 sm:p-8 overflow-hidden text-white font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <span className="text-4xl">🏛️</span> Archive.org Каталог
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select 
          className="bg-gray-800 border border-gray-700 text-white p-3 rounded-lg flex-1 font-bold"
          value={collection.id}
          onChange={(e) => setCollection(COLLECTIONS.find(c => c.id === e.target.value) || COLLECTIONS[0])}
        >
          {COLLECTIONS.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        
        <input 
          type="text" 
          placeholder="Поиск по названию (напр. Mario)..." 
          className="bg-gray-800 border border-gray-700 text-white p-3 rounded-lg flex-[2]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-900/50 rounded-xl border border-gray-800 p-2 sm:p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Загрузка базы игр... (это может занять пару секунд)
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.length === 0 && search && (
              <div className="col-span-full text-center text-gray-500 mt-10">Игры не найдены</div>
            )}
            {filtered.map(f => {
              const cleanName = f.name.replace(/\.(zip|nes|sfc|md|bin)$/i, '');
              const isDownloading = downloading === f.name;
              return (
                <div key={f.name} className="bg-gray-800 border border-gray-700 p-3 rounded-lg flex justify-between items-center hover:bg-gray-750 transition-colors">
                  <div className="overflow-hidden pr-3">
                    <h3 className="font-bold text-sm truncate" title={cleanName}>{cleanName}</h3>
                    <p className="text-xs text-gray-500 mt-1">{(parseInt(f.size || '0') / 1024).toFixed(1)} KB</p>
                  </div>
                  <button 
                    onClick={() => handleDownload(f)}
                    disabled={!!downloading}
                    className={`shrink-0 px-4 py-2 rounded font-bold text-xs ${isDownloading ? 'bg-gray-600 text-gray-300' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'}`}
                  >
                    {isDownloading ? 'Загрузка...' : 'Играть'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
