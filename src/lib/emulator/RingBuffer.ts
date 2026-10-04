export class RingBuffer {
  private buffer: Float32Array;
  private head: number = 0;
  private tail: number = 0;
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Float32Array(capacity);
  }

  public enq(value: number): void {
    this.buffer[this.tail] = value;
    this.tail = (this.tail + 1) % this.capacity;
    if (this.tail === this.head) {
      this.head = (this.head + 1) % this.capacity;
    }
  }

  public deq(): number {
    if (this.isEmpty()) return 0;
    const value = this.buffer[this.head];
    this.head = (this.head + 1) % this.capacity;
    return value;
  }

  public isEmpty(): boolean {
    return this.head === this.tail;
  }
}