import React, { useState, useEffect } from 'react';
import { Radio, Play, Pause, Volume2, Sparkles } from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';

export const MoodMusicView: React.FC<{ payload?: any }> = ({ payload }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const genre = payload?.genre || 'Lo-Fi';
  const energy = payload?.energy || 'medium';
  const title = payload?.title || 'Edge Ambient Atmosphere #402';

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      // Play ambient chords periodically
      const chords = [
        ['C4', 'E4', 'G4', 'B4'],
        ['A3', 'C4', 'E4', 'G4'],
        ['F3', 'A3', 'C4', 'E4'],
        ['G3', 'B3', 'D4', 'F4'],
      ];
      let chordIdx = 0;

      const triggerChord = () => {
        const chord = chords[chordIdx % chords.length];
        chord.forEach((n, i) => {
          setTimeout(() => audioSynth.playNote(n, 2.5), i * 180);
        });
        chordIdx++;
      };

      triggerChord();
      interval = setInterval(() => {
        triggerChord();
        setCurrentProgress((p) => (p >= 100 ? 0 : p + 4));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Mood Soundtrack Synthesizer</h4>
            <p className="text-xs text-slate-400">Algorithmic generative audio environment</p>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs font-semibold text-purple-300 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {genre} ({energy})
        </span>
      </div>

      <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all shadow-lg ${
              isPlaying
                ? 'bg-purple-600 shadow-purple-600/50 scale-105'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <div>
            <div className="text-xs font-bold text-slate-200">{title}</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Volume2 className="w-3 h-3 text-purple-400" />
              <span>{isPlaying ? 'Synthesizing polyphonic harmonics...' : 'Paused'}</span>
            </div>
          </div>
        </div>

        {/* Animated Equalizer Bars */}
        <div className="flex items-end gap-1 h-8 px-4">
          {[35, 65, 45, 85, 95, 60, 40, 75, 55, 90, 30].map((height, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-300 ${
                isPlaying ? 'bg-purple-500' : 'bg-slate-800'
              }`}
              style={{
                height: isPlaying ? `${Math.max(15, (height * (1 + (i % 3) * 0.2)) % 100)}%` : '20%',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
