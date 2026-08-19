import React, { useState, useEffect } from 'react';
import { Play, Volume2, Music, Sparkles } from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';

interface VirtualPianoViewProps {
  payload?: {
    songTitle?: string;
    notes?: string[];
    tempo?: number;
  };
}

export const VirtualPianoView: React.FC<VirtualPianoViewProps> = ({ payload }) => {
  const [octaveOffset, setOctaveOffset] = useState<number>(4);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isPlayingSong, setIsPlayingSong] = useState<boolean>(false);

  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeys: { note: string; leftOffsetPercent: number }[] = [
    { note: 'C#', leftOffsetPercent: 10 },
    { note: 'D#', leftOffsetPercent: 24.5 },
    { note: 'F#', leftOffsetPercent: 53 },
    { note: 'G#', leftOffsetPercent: 67.5 },
    { note: 'A#', leftOffsetPercent: 82 },
  ];

  const handlePlayNote = (noteWithOctave: string) => {
    setActiveKey(noteWithOctave);
    audioSynth.playNote(noteWithOctave, 0.9);
    setTimeout(() => setActiveKey(null), 300);
  };

  const handlePlaySequence = async () => {
    if (isPlayingSong) return;
    setIsPlayingSong(true);
    const notesToPlay = payload?.notes || ['C4', 'E4', 'G4', 'B4', 'C5', 'G4', 'E4', 'C4'];
    const delay = Math.max(150, Math.floor(60000 / (payload?.tempo || 120)));

    for (const n of notesToPlay) {
      handlePlayNote(n);
      await new Promise((r) => setTimeout(r, delay));
    }
    setIsPlayingSong(false);
  };

  // Keyboard binding for home row notes
  useEffect(() => {
    const keyMap: Record<string, string> = {
      a: `C${octaveOffset}`,
      w: `C#${octaveOffset}`,
      s: `D${octaveOffset}`,
      e: `D#${octaveOffset}`,
      d: `E${octaveOffset}`,
      f: `F${octaveOffset}`,
      t: `F#${octaveOffset}`,
      g: `G${octaveOffset}`,
      y: `G#${octaveOffset}`,
      h: `A${octaveOffset}`,
      u: `A#${octaveOffset}`,
      j: `B${octaveOffset}`,
      k: `C${octaveOffset + 1}`,
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      const note = keyMap[e.key.toLowerCase()];
      if (note && !activeKey) {
        handlePlayNote(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [octaveOffset, activeKey]);

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl max-w-full overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">
              {payload?.songTitle || '88-Key Virtual Synthesizer'}
            </h4>
            <p className="text-xs text-slate-400">Play via touch, mouse, or keyboard (A-K keys)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-lg p-1 text-xs">
            <span className="px-2 text-slate-400">Octave:</span>
            {[2, 3, 4, 5, 6].map((oct) => (
              <button
                key={oct}
                onClick={() => setOctaveOffset(oct)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  octaveOffset === oct
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                C{oct}
              </button>
            ))}
          </div>

          <button
            onClick={handlePlaySequence}
            disabled={isPlayingSong}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPlayingSong ? 'Playing...' : 'Play Song'}</span>
          </button>
        </div>
      </div>

      {/* Piano Keyboard Viewport */}
      <div className="relative h-44 bg-slate-950 p-2 rounded-lg border border-slate-800 select-none shadow-inner overflow-x-auto">
        <div className="relative h-full flex w-[480px] sm:w-full min-w-[320px]">
          {/* White keys */}
          {whiteKeys.map((note) => {
            const noteName = `${note}${octaveOffset}`;
            const isActive = activeKey === noteName;
            return (
              <button
                key={noteName}
                onClick={() => handlePlayNote(noteName)}
                className={`flex-1 h-full rounded-b-md border border-slate-400/40 flex flex-col justify-end items-center pb-2 transition-all active:scale-[0.98] ${
                  isActive
                    ? 'bg-indigo-200 shadow-md shadow-indigo-500/50 scale-[0.98]'
                    : 'bg-gradient-to-b from-slate-100 to-slate-200 hover:from-white hover:to-slate-100'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-700">{noteName}</span>
              </button>
            );
          })}

          {/* Black keys */}
          {blackKeys.map(({ note, leftOffsetPercent }) => {
            const noteName = `${note}${octaveOffset}`;
            const isActive = activeKey === noteName;
            return (
              <button
                key={noteName}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayNote(noteName);
                }}
                style={{ left: `${leftOffsetPercent}%` }}
                className={`absolute top-0 w-[9%] h-[60%] z-10 rounded-b-md border border-slate-900 flex flex-col justify-end items-center pb-1 transition-all active:scale-[0.96] ${
                  isActive
                    ? 'bg-indigo-600 shadow-lg shadow-indigo-600/50'
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                <span className="text-[9px] font-mono text-slate-300">{note}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span className="flex items-center gap-1">
          <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
          Web Audio Polyphonic Synthesizer Engine
        </span>
        <span className="flex items-center gap-1 font-mono text-slate-500">
          <Sparkles className="w-3 h-3 text-amber-400" />
          44.1kHz 16-bit
        </span>
      </div>
    </div>
  );
};
