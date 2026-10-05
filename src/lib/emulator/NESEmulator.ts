import { NES } from 'jsnes';
import { RingBuffer } from './RingBuffer';
import { getAudioContext } from '../audioContext';

export class NESEmulator {
  private nes: NES;
  private canvasCtx: CanvasRenderingContext2D;
  private audioCtx: AudioContext;
  private scriptProcessor: ScriptProcessorNode;
  private ringBuffer: RingBuffer;
  private animationFrameId: number = 0;
  private isRunning: boolean = false;
  private fpsInterval = 1000 / 60;
  private then = performance.now();

  public onError: ((msg: string) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvasCtx = canvas.getContext('2d', { alpha: false })!;
    this.audioCtx = getAudioContext();
    this.ringBuffer = new RingBuffer(8192);
    
    this.scriptProcessor = this.audioCtx.createScriptProcessor(4096, 0, 1);
    this.scriptProcessor.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < output.length; i++) {
        output[i] = this.ringBuffer.deq() || 0;
      }
    };
    this.scriptProcessor.connect(this.audioCtx.destination);

    this.nes = new NES({
      onFrame: this.onFrame,
      onAudioSample: (left: number, _right: number) => {
        this.ringBuffer.enq(left);
      },
      sampleRate: 44100,
    });
  }

  private onFrame = (frameBuffer: number[]) => {
    const imageData = this.canvasCtx.createImageData(256, 240);
    for (let i = 0; i < 256 * 240; i++) {
        const pixel = frameBuffer[i];
        const offset = i * 4;
        imageData.data[offset] = pixel & 0xFF;         
        imageData.data[offset + 1] = (pixel >> 8) & 0xFF;  
        imageData.data[offset + 2] = (pixel >> 16) & 0xFF; 
        imageData.data[offset + 3] = 255;                  
    }
    this.canvasCtx.putImageData(imageData, 0, 0);
  };

  public loadROM(buffer: ArrayBuffer) {
    const u8 = new Uint8Array(buffer);
    const chars = new Array(u8.length);
    for (let i = 0; i < u8.length; i++) {
      chars[i] = String.fromCharCode(u8[i]);
    }
    const romString = chars.join('');
    
    this.nes.loadROM(romString);
  }

  public start() {
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => console.warn('Audio resume blocked'));
      }
    } catch(err) {
      console.warn('Audio resume error', err);
    }
    
    this.isRunning = true;
    this.then = performance.now();
    this.loop();
  }

  public resumeAudio() {
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
    } catch(err) {}
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrameId);
    if (this.audioCtx.state !== 'suspended') {
      this.audioCtx.suspend();
    }
  }

  private loop = () => {
    if (!this.isRunning) return;
    
    try {
      const now = performance.now();
      const elapsed = now - this.then;
      
      if (elapsed > this.fpsInterval) {
        this.then = now - (elapsed % this.fpsInterval);
        this.nes.frame();
      }
      
      this.animationFrameId = requestAnimationFrame(this.loop);
    } catch (err: any) {
      this.isRunning = false;
      if (this.onError) this.onError('Frame Crash: ' + err.message);
    }
  };

  public buttonDown(player: number, button: number) { this.nes.buttonDown(player, button); }
  public buttonUp(player: number, button: number) { this.nes.buttonUp(player, button); }

  public saveState(): any {
    return this.nes.toJSON();
  }

  public loadState(data: any) {
    this.nes.fromJSON(data);
  }
}

