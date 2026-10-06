import { Peer } from 'peerjs';
import type { DataConnection } from 'peerjs';

export type NetplayMessage = 
  | { type: 'ROM'; title: string; system: string; buffer: ArrayBuffer }
  | { type: 'READY' }
  | { type: 'INPUT'; btn: string; isDown: boolean }
  | { type: 'SYNC'; state: ArrayBuffer };

const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }
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

  hostGame(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.disconnect();
      this.role = 'host';
      this.peer = new Peer(PEER_CONFIG);
      this.peer.on('open', (id) => {
        resolve(id);
      });
      this.peer.on('connection', (connection) => {
        this.conn = connection;
        this.setupConnection();
      });
      this.peer.on('error', reject);
    });
  }

  joinGame(hostId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.disconnect();
      this.role = 'client';
      this.peer = new Peer(PEER_CONFIG);
      this.peer.on('open', () => {
        this.conn = this.peer!.connect(hostId, { reliable: true });
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
