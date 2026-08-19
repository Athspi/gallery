import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';

export const WikipediaView: React.FC<{ payload?: any }> = ({ payload }) => {
  const title = payload?.title || 'Google Gemma';
  const extract = payload?.extract || payload?.result || 'Gemma is a family of lightweight, state-of-the-art open models built from the same research and technology used to create the Gemini models.';
  const url = payload?.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`;

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Wikipedia Knowledge Base</h4>
            <p className="text-xs text-slate-400">Live encyclopedic extract & structured summary</p>
          </div>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
        >
          <span>Wikipedia Article</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
        <h5 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <span>📖</span> {title}
        </h5>
        <p className="text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto pr-1 whitespace-pre-wrap">
          {extract}
        </p>
      </div>
    </div>
  );
};
