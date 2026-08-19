// Web Audio API Polyphonic Synthesizer for Piano and SFX

class AudioSynthesizer {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Frequency calculation for Piano Note (e.g. 'C4', 'A#4', 'Db5')
  public noteToFreq(note: string): number {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const regex = /^([A-G][#b]?)([0-8])$/;
    const match = note.match(regex);
    if (!match) return 440;

    let key = match[1];
    const octave = parseInt(match[2], 10);

    // Normalize flats to sharps
    if (key === 'Db') key = 'C#';
    if (key === 'Eb') key = 'D#';
    if (key === 'Gb') key = 'F#';
    if (key === 'Ab') key = 'G#';
    if (key === 'Bb') key = 'A#';

    const semitone = notes.indexOf(key);
    // A4 = 440Hz, octave 4, note index 9 (A)
    const midiNumber = (octave + 1) * 12 + semitone;
    return 440 * Math.pow(2, (midiNumber - 69) / 12);
  }

  public playNote(note: string, duration: number = 0.8) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const freq = this.noteToFreq(note);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Warm acoustic piano-like harmonic timbre using triangle + sine blending
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.4, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  public playSoundEffect(type: 'water' | 'plant' | 'harvest' | 'click' | 'success' | 'alert') {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (type === 'click') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'water') {
        // Soft white noise / water splash
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.linearRampToValueAtTime(700, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'success' || type === 'harvest') {
        // Arpeggiated chord
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.12, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.35);
        });
      }
    } catch (e) {
      console.warn('SFX error:', e);
    }
  }
}

export const audioSynth = new AudioSynthesizer();
