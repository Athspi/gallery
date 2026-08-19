import React, { useState } from 'react';
import { MapPin, ExternalLink, Navigation, Search } from 'lucide-react';

export const InteractiveMapView: React.FC<{ payload?: any }> = ({ payload }) => {
  const [location, setLocation] = useState<string>(payload?.location || 'Tokyo, Japan');
  const [currentEmbed, setCurrentEmbed] = useState<string>(
    `https://maps.google.com/maps?q=${encodeURIComponent(payload?.location || 'Tokyo, Japan')}&output=embed`
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) return;
    setCurrentEmbed(`https://maps.google.com/maps?q=${encodeURIComponent(location.trim())}&output=embed`);
  };

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Interactive Map Viewport</h4>
            <p className="text-xs text-slate-400">Embedded spatial geospatial explorer</p>
          </div>
        </div>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
        >
          <span>Open Full Map</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search address, landmark, city..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Navigate
        </button>
      </form>

      <div className="w-full h-64 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 relative">
        <iframe
          title="Interactive Map"
          src={currentEmbed}
          width="100%"
          height="100%"
          className="border-0"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
};
