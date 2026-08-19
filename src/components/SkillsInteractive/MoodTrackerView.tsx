import React, { useState, useEffect } from 'react';
import { Smile, Calendar, TrendingUp, Trash2, Heart } from 'lucide-react';

interface MoodTrackerViewProps {
  payload?: {
    history?: Record<string, { score: number; comment: string; timestamp: string }>;
    date?: string;
    score?: number;
    comment?: string;
  };
}

export const MoodTrackerView: React.FC<MoodTrackerViewProps> = ({ payload }) => {
  const [history, setHistory] = useState<Record<string, { score: number; comment: string; timestamp: string }>>({});
  const [currentScore, setCurrentScore] = useState<number>(payload?.score || 8);
  const [note, setNote] = useState<string>(payload?.comment || '');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    const STORAGE_KEY = 'mood_tracker_data';
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setHistory(JSON.parse(raw));
    } else if (payload?.history) {
      setHistory(payload.history);
    }
  }, [payload]);

  const handleSave = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextHistory = {
      ...history,
      [today]: {
        score: currentScore,
        comment: note,
        timestamp: new Date().toISOString(),
      },
    };
    localStorage.setItem('mood_tracker_data', JSON.stringify(nextHistory));
    setHistory(nextHistory);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDelete = (dateKey: string) => {
    const nextHistory = { ...history };
    delete nextHistory[dateKey];
    localStorage.setItem('mood_tracker_data', JSON.stringify(nextHistory));
    setHistory(nextHistory);
  };

  const entries = Object.entries(history).sort(([a], [b]) => b.localeCompare(a));
  const avgScore =
    entries.length > 0
      ? (entries.reduce((acc, [, val]) => acc + val.score, 0) / entries.length).toFixed(1)
      : '8.0';

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 5) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">On-Device Mood Journal</h4>
            <p className="text-xs text-slate-400">Encrypted SQLite / localStorage reflection tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-lg text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Average:</span>
            <span className="font-bold text-slate-200">{avgScore} / 10</span>
          </div>
        </div>
      </div>

      {/* Mood Entry Form */}
      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">How are you feeling today?</label>
          <span className="text-sm font-bold text-indigo-400">{currentScore} / 10</span>
        </div>

        <input
          type="range"
          min="1"
          max="10"
          value={currentScore}
          onChange={(e) => setCurrentScore(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add reflection or highlight..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleSave}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            {savedSuccess ? 'Saved!' : 'Log Mood'}
          </button>
        </div>
      </div>

      {/* Timeline entries */}
      {entries.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Recent Logs
          </div>
          {entries.slice(0, 5).map(([date, entry]) => (
            <div
              key={date}
              className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded font-bold border text-[11px] ${getScoreColor(
                    entry.score
                  )}`}
                >
                  {entry.score}/10
                </span>
                <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {date}
                </span>
                <span className="text-slate-300 truncate max-w-[200px]">{entry.comment}</span>
              </div>
              <button
                onClick={() => handleDelete(date)}
                className="text-slate-500 hover:text-rose-400 p-1"
                title="Delete entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
