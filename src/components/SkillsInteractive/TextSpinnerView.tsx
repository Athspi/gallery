import React, { useState, useRef, useEffect } from 'react';
import { Disc, Play, RotateCcw } from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';

export const TextSpinnerView: React.FC<{ payload?: any }> = ({ payload }) => {
  const [options, setOptions] = useState<string[]>(
    payload?.options || ['Pizza', 'Tacos', 'Sushi', 'Ramen', 'Burgers', 'Salad']
  );
  const [newOption, setNewOption] = useState<string>('');
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#6366f1'];

  useEffect(() => {
    drawWheel();
  }, [options, rotation]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;
    const radius = center - 15;
    const arc = (2 * Math.PI) / options.length;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((rotation * Math.PI) / 180);

    options.forEach((opt, idx) => {
      const angle = idx * arc;
      ctx.beginPath();
      ctx.fillStyle = colors[idx % colors.length];
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + arc);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.save();
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(opt.slice(0, 12), radius - 15, 5);
      ctx.restore();
    });

    ctx.restore();

    // Center hub
    ctx.beginPath();
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Arrow pointer on top right
    ctx.beginPath();
    ctx.moveTo(size - 10, center);
    ctx.lineTo(size - 28, center - 10);
    ctx.lineTo(size - 28, center + 10);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWinner(null);
    audioSynth.playSoundEffect('click');

    const totalDegrees = 1440 + Math.floor(Math.random() * 360);
    const finalRot = rotation + totalDegrees;
    setRotation(finalRot);

    setTimeout(() => {
      setIsSpinning(false);
      const normalized = (360 - (finalRot % 360)) % 360;
      const index = Math.floor(normalized / (360 / options.length));
      const winningOption = options[index % options.length];
      setWinner(winningOption);
      audioSynth.playSoundEffect('success');
    }, 3000);
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOption.trim()) return;
    setOptions([...options, newOption.trim()]);
    setNewOption('');
  };

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <Disc className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Text Decision Spinner</h4>
            <p className="text-xs text-slate-400">Randomized choice roulette with physics easing</p>
          </div>
        </div>

        {winner && (
          <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 font-bold text-xs animate-bounce">
            🎉 Winner: {winner}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center bg-slate-950 p-4 rounded-lg border border-slate-800">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-56 h-56 transition-transform duration-[3000ms] ease-out"
          />
        </div>

        <div className="flex flex-col gap-3 w-full sm:w-56">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            <Play className="w-4 h-4 fill-current" />
            {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
          </button>

          <form onSubmit={handleAddOption} className="flex gap-1.5">
            <input
              type="text"
              placeholder="Add choice..."
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-md text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-md"
            >
              Add
            </button>
          </form>

          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {options.map((opt, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 rounded flex items-center gap-1"
              >
                {opt}
                {options.length > 2 && (
                  <button
                    onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
