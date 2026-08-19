import React, { useState } from 'react';
import { Flower2, Droplet, Sparkles, Sprout, SunMedium } from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';

interface GardenPlot {
  id: number;
  plantType: 'daisy' | 'rose' | 'sunflower' | 'tulip' | null;
  stage: 'empty' | 'seed' | 'sprout' | 'bloom';
  moisture: number; // 0-100
  bloomTime?: number;
}

export const TinyGardenView: React.FC<{ payload?: any }> = ({ payload }) => {
  const [plots, setPlots] = useState<GardenPlot[]>([
    { id: 0, plantType: 'rose', stage: 'bloom', moisture: 75 },
    { id: 1, plantType: 'sunflower', stage: 'sprout', moisture: 40 },
    { id: 2, plantType: 'daisy', stage: 'bloom', moisture: 90 },
    { id: 3, plantType: 'tulip', stage: 'seed', moisture: 30 },
    { id: 4, plantType: null, stage: 'empty', moisture: 0 },
    { id: 5, plantType: null, stage: 'empty', moisture: 0 },
  ]);

  const [selectedSeed, setSelectedSeed] = useState<'daisy' | 'rose' | 'sunflower' | 'tulip'>('rose');
  const [harvestScore, setHarvestScore] = useState<number>(12);
  const [selectedTool, setSelectedTool] = useState<'plant' | 'water' | 'harvest'>('water');

  const handlePlotClick = (plotIndex: number) => {
    setPlots((prev) => {
      const next = [...prev];
      const plot = { ...next[plotIndex] };

      if (selectedTool === 'plant' && plot.stage === 'empty') {
        plot.plantType = selectedSeed;
        plot.stage = 'seed';
        plot.moisture = 50;
        audioSynth.playSoundEffect('plant');
      } else if (selectedTool === 'water' && plot.stage !== 'empty') {
        plot.moisture = Math.min(100, plot.moisture + 35);
        if (plot.stage === 'seed') plot.stage = 'sprout';
        else if (plot.stage === 'sprout') plot.stage = 'bloom';
        audioSynth.playSoundEffect('water');
      } else if (selectedTool === 'harvest' && plot.stage === 'bloom') {
        plot.stage = 'empty';
        plot.plantType = null;
        plot.moisture = 0;
        setHarvestScore((s) => s + 5);
        audioSynth.playSoundEffect('harvest');
      }

      next[plotIndex] = plot;
      return next;
    });
  };

  const plantEmojis: Record<string, string> = {
    daisy: '🌼',
    rose: '🌹',
    sunflower: '🌻',
    tulip: '🌷',
  };

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Flower2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Tiny Garden Eco-Bed</h4>
            <p className="text-xs text-slate-400">Manage on-device botanical plots & nurture blooms</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Harvest: {harvestScore} Flowers
          </div>
        </div>
      </div>

      {/* Tool Selector Bar */}
      <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800 mb-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSelectedTool('water')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedTool === 'water' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Droplet className="w-3.5 h-3.5" />
            Water
          </button>
          <button
            onClick={() => setSelectedTool('plant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedTool === 'plant' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            Plant
          </button>
          <button
            onClick={() => setSelectedTool('harvest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedTool === 'harvest' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <SunMedium className="w-3.5 h-3.5" />
            Harvest
          </button>
        </div>

        {selectedTool === 'plant' && (
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-md">
            {(['rose', 'sunflower', 'daisy', 'tulip'] as const).map((seed) => (
              <button
                key={seed}
                onClick={() => setSelectedSeed(seed)}
                className={`px-2 py-0.5 rounded text-sm ${
                  selectedSeed === seed ? 'bg-slate-700 shadow' : 'opacity-60 hover:opacity-100'
                }`}
                title={seed}
              >
                {plantEmojis[seed]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Garden Plots Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {plots.map((plot) => (
          <button
            key={plot.id}
            onClick={() => handlePlotClick(plot.id)}
            className={`h-28 rounded-xl border flex flex-col items-center justify-between p-2 transition-all hover:scale-105 active:scale-95 ${
              plot.stage === 'empty'
                ? 'bg-amber-950/20 border-amber-900/30 hover:border-amber-700'
                : 'bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-600'
            }`}
          >
            <div className="w-full flex justify-between items-center text-[10px] text-slate-500">
              <span>#{plot.id + 1}</span>
              {plot.stage !== 'empty' && (
                <span className="flex items-center gap-0.5 text-sky-400">
                  <Droplet className="w-2.5 h-2.5" />
                  {plot.moisture}%
                </span>
              )}
            </div>

            <div className="text-3xl my-auto animate-bounce-subtle">
              {plot.stage === 'empty' && <span className="text-stone-700 text-lg">🕳️</span>}
              {plot.stage === 'seed' && <span className="text-amber-600 text-lg">🌱</span>}
              {plot.stage === 'sprout' && <span className="text-emerald-500 text-xl">🌿</span>}
              {plot.stage === 'bloom' && plot.plantType && (
                <span className="scale-125">{plantEmojis[plot.plantType]}</span>
              )}
            </div>

            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-500 h-full transition-all duration-300"
                style={{ width: `${plot.moisture}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
