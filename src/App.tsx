import { useStore } from './store/useStore';
import { Catalog } from './components/Catalog';
import { Player } from './components/Player';

function App() {
  const activeGameId = useStore(state => state.activeGameId);
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {activeGameId ? <Player /> : <Catalog />}
    </div>
  );
}

export default App;