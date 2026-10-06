import Peer, { type DataConnection } from 'peerjs';

export type NetplayMessage = 
  | { type: 'ROM'; title: string; system: string; buffer: ArrayBuffer }
  | { type: 'READY' }
  | { type: 'INPUT'; btn: string; isDown: boolean }
  | { type: 'SYNC'; state: ArrayBuffer };

const PEER_SERVERS = [
  {}, // Default official server (0.peerjs.com)
  { host: 'peerjs-server.onrender.com', port: 443, secure: true, path: '/' }
];

const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

class NetplayManager {
  peer: Peer | null = null;
  conn: DataConnection | null = null;
  role: 'host' | 'client' | null = null;
  
  onRomReceived?: (title: string, system: string, buffer: ArrayBuffer) => void;
  onClientReady?: () => void;
  onInputReceived?: (btn: string, isDown: boolean) => void;
  onSyncReceived?: (state: ArrayBuffer) => void;
  onConnectionStatus?: (status: string) => void;

  private tryCreatePeer(serverIndex: number): Promise<[Peer, number]> {
    return new Promise((resolve, reject) => {
      if (serverIndex >= PEER_SERVERS.length) {
        reject(new Error('Все сервера недоступны. Проверьте VPN или антивирус.'));
        return;
      }
      
      const config = { ...PEER_SERVERS[serverIndex], config: ICE_CONFIG };
      const peer = new Peer(config);
      
      const onOpen = () => {
        peer.off('error', onError);
        peer.off('open', onOpen);
        resolve([peer, serverIndex]);
      };
      
      const onError = (err: any) => {
        peer.off('open', onOpen);
        peer.off('error', onError);
        peer.destroy();
        console.warn(`PeerJS server ${serverIndex} failed:`, err);
        this.tryCreatePeer(serverIndex + 1).then(resolve).catch(reject);
      };
      
      peer.on('open', onOpen);
      peer.on('error', onError);
    });
  }

  hostGame(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.disconnect();
      this.role = 'host';
      
      this.tryCreatePeer(0).then(([peer, serverIndex]) => {
        this.peer = peer;
        const hostId = `${serverIndex}-${peer.id}`;
        
        this.peer.on('connection', (connection: DataConnection) => {
          this.conn = connection;
          this.setupConnection();
        });
        
        this.peer.on('error', (err: any) => {
           console.error('Peer error:', err);
           this.onConnectionStatus?.('Error: ' + String(err.type || err.message));
        });
        
        resolve(hostId);
      }).catch(reject);
    });
  }

  joinGame(inviteId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.disconnect();
      this.role = 'client';
      
      const parts = inviteId.split('-');
      const serverIndex = parseInt(parts[0], 10);
      const hostId = parts.slice(1).join('-');
      
      if (isNaN(serverIndex) || !hostId) {
         reject(new Error('Неверная ссылка-приглашение.'));
         return;
      }

      const config = { ...PEER_SERVERS[serverIndex], config: ICE_CONFIG };
      this.peer = new Peer(config);
      this.peer.on('open', () => {
        if (!this.peer) return;
        this.conn = this.peer.connect(hostId, { reliable: true });
        this.conn.on('open', () => {
          this.setupConnection();
          resolve();
        });
        this.conn.on('error', reject);
      });
      this.peer.on('error', reject);
    });
  }

  private setupConnection() {
    if (!this.conn) return;
    this.onConnectionStatus?.('Connected');
    
    this.conn.on('data', async (data: any) => {
      const msg = data as NetplayMessage;
      
      if (msg.type === 'ROM') {
        this.onRomReceived?.(msg.title, msg.system, msg.buffer);
      } else if (msg.type === 'READY') {
        this.onClientReady?.();
      } else if (msg.type === 'INPUT') {
        this.onInputReceived?.(msg.btn, msg.isDown);
      } else if (msg.type === 'SYNC') {
        this.onSyncReceived?.(msg.state);
      }
    });

    this.conn.on('close', () => {
      this.onConnectionStatus?.('Disconnected');
      this.disconnect();
    });
  }

  sendRom(title: string, system: string, buffer: ArrayBuffer) {
    if (this.conn && this.role === 'host') {
      this.conn.send({ type: 'ROM', title, system, buffer });
    }
  }

  sendReady() {
    if (this.conn && this.role === 'client') {
      this.conn.send({ type: 'READY' });
    }
  }

  sendInput(btn: string, isDown: boolean) {
    if (this.conn) {
      this.conn.send({ type: 'INPUT', btn, isDown });
    }
  }

  sendSync(state: ArrayBuffer) {
    if (this.conn && this.role === 'host') {
      this.conn.send({ type: 'SYNC', state });
    }
  }

  disconnect() {
    this.conn?.close();
    this.peer?.destroy();
    this.conn = null;
    this.peer = null;
    this.role = null;
  }
}

export const netplayManager = new NetplayManager();
