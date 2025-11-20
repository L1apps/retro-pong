/**
 * Simple synthesizer for game sound effects using Web Audio API.
 * No external assets required.
 */
export class SoundService {
  private context: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.context = new AudioContextClass();
      }
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled && this.context?.state === 'suspended') {
      this.context.resume();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    if (!this.enabled || !this.context) return;
    
    // Create oscillator
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.context.currentTime);
    
    gain.gain.setValueAtTime(volume, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.context.destination);

    osc.start();
    osc.stop(this.context.currentTime + duration);
  }

  public playPaddleHit() {
    this.playTone(440, 'square', 0.1);
  }

  public playWallHit() {
    this.playTone(220, 'square', 0.1);
  }

  public playScore() {
    // Happy arpeggio
    if (!this.enabled || !this.context) return;
    const now = this.context.currentTime;
    this.scheduleNote(523.25, now);
    this.scheduleNote(659.25, now + 0.1);
    this.scheduleNote(783.99, now + 0.2);
  }

  public playLoss() {
    // Sad slide
    this.playTone(150, 'sawtooth', 0.4, 0.2);
  }

  private scheduleNote(freq: number, time: number) {
    if (!this.context) return;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.linearRampToValueAtTime(0, time + 0.1);
    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(time);
    osc.stop(time + 0.1);
  }
}

export const soundManager = new SoundService();