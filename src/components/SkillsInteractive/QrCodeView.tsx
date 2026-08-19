import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Copy, Check } from 'lucide-react';
import QRCode from 'qrcode';

export const QrCodeView: React.FC<{ payload?: any }> = ({ payload }) => {
  const [url, setUrl] = useState<string>(payload?.url || 'https://github.com/google-ai-edge/gallery');
  const [shape, setShape] = useState<'square' | 'circle'>(payload?.shape || 'square');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (payload?.url) setUrl(payload.url);
    if (payload?.shape) setShape(payload.shape);
  }, [payload]);

  useEffect(() => {
    QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#0f172a', light: '#ffffff' } }, (err, str) => {
      if (!err && str) {
        setDataUrl(str);
      }
    });
  }, [url]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'ai-edge-qrcode.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">On-Device QR Generator</h4>
            <p className="text-xs text-slate-400">High-error-correction barcode matrix</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-950 p-4 rounded-lg border border-slate-800">
        <div className="relative p-3 bg-white rounded-xl shadow-lg">
          {dataUrl && (
            <img
              src={dataUrl}
              alt="QR Code"
              className={`w-40 h-40 transition-all ${shape === 'circle' ? 'rounded-full overflow-hidden' : 'rounded-none'}`}
            />
          )}
        </div>

        <div className="flex-1 w-full space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1">Target Payload</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Shape:</span>
            <button
              onClick={() => setShape('square')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                shape === 'square' ? 'bg-sky-600 text-white font-semibold' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Square
            </button>
            <button
              onClick={() => setShape('circle')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                shape === 'circle' ? 'bg-sky-600 text-white font-semibold' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Circular Clip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
