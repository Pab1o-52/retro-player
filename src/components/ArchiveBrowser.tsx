import { useState, useEffect } from 'react';
import { t } from '../lib/i18n';
import { useStore } from '../store/useStore';

const COLLECTIONS = [
  { id: 'No-Intro_NES', name: 'NES (Dendy)', system: 'nes' },
  { id: 'ef_nintendo_snes_no-intro_2024-04-20', name: 'Super Nintendo', system: 'snes' },
  { id: 'ef_mega_genesis_no-intro_2024-04-21', name: 'Sega Mega Drive', system: 'segaMD' }
];

interface ArchiveFile {
  name: string;
  size: string;
}

export const ArchiveBrowser = ({ onDownload, onClose }: { onDownload: (file: File, system: string) => void, onClose: () => void }) => {
  const language = useStore(s => s.language);
  const [collection, setCollection] = useState(COLLECTIONS[0]);
  const [files, setFiles] = useState<ArchiveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [limit, setLimit] = useState(50);

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
      setProgress(0);
      const url = `https://cors.archive.org/cors/${collection.id}/${encodeURIComponent(file.name)}`;
      const res = await fetch(url);
      if (!res.ok || res.headers.get('content-type')?.includes('text/html')) {
        throw new Error("Network response was not ok or blocked by CORS");
      }
      
      const total = parseInt((file as any).size || '0', 10) || 0;
      
      if (!res.body) {
        const blob = await res.blob();
        const newFile = new File([blob], file.name);
        onDownload(newFile, collection.system);
        return;
      }
      
      const reader = res.body.getReader();
      let received = 0;
      const chunks = [];
      
      while(true) {
        const {done, value} = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total > 0) setProgress((received / total) * 100);
      }
      
      const blob = new Blob(chunks, { type: 'application/octet-stream' });
      const newFile = new File([blob], file.name);
      onDownload(newFile, collection.system);
    } catch (e) {
      console.error(e);
      alert(t('archive_error', language));
    } finally {
      setDownloading(null);
      setProgress(0);
    }
  };

  const allFiltered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const filtered = allFiltered.slice(0, limit);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex flex-col p-4 sm:p-8 overflow-hidden text-white font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <span className="text-4xl">🏛️</span> {t('archive_title', language)}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select 
          className="bg-gray-800 border border-gray-700 text-white p-3 rounded-lg flex-1 font-bold"
          value={collection.id}
          onChange={(e) => { setCollection(COLLECTIONS.find(c => c.id === e.target.value) || COLLECTIONS[0]); setLimit(50); }}
        >
          {COLLECTIONS.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        
        <input 
          type="text" 
          placeholder={t('archive_search_placeholder', language)} 
          className="bg-gray-800 border border-gray-700 text-white p-3 rounded-lg flex-[2]"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setLimit(50); }}
        />
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-900/50 rounded-xl border border-gray-800 p-2 sm:p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            {t('archive_loading', language)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.length === 0 && search && (
              <div className="col-span-full text-center text-gray-500 mt-10">{t('archive_not_found', language)}</div>
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
                    className={`relative overflow-hidden shrink-0 px-4 py-2 rounded font-bold text-xs ${isDownloading ? 'bg-gray-700 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'}`}
                  >
                    {isDownloading && progress > 0 && (
                      <div className="absolute top-0 left-0 h-full bg-blue-500 opacity-60 pointer-events-none transition-all duration-300" style={{ width: `${progress}%` }} />
                    )}
                    <span className="relative z-10">{isDownloading ? (progress > 0 ? `${Math.round(progress)}%` : t('btn_downloading', language)) : t('btn_download', language)}</span>
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
