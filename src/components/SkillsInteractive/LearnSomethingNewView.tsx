import React, { useRef, useEffect } from 'react';
import { Lightbulb, Download, Share2 } from 'lucide-react';
import QRCode from 'qrcode';

interface LearnSomethingNewViewProps {
  payload?: {
    topic?: string;
    description?: string;
    sourceUrl?: string;
  };
}

export const LearnSomethingNewView: React.FC<LearnSomethingNewViewProps> = ({ payload }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const topic = payload?.topic || 'LiteRT Neural Processing';
  const description =
    payload?.description ||
    'Quantized models running on mobile NPUs achieve over 60 tokens per second while consuming under 2 watts of power.';
  const sourceUrl = payload?.sourceUrl || 'https://ai.google.dev/edge';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 720;
    canvas.height = 720;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 720, 720);
    grad.addColorStop(0, '#f43f5e');
    grad.addColorStop(0.5, '#ec4899');
    grad.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 720, 720);

    // Card Surface
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(40, 40, 640, 640, 28);
    ctx.fill();

    // Badge
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('💡 TODAY I LEARNED', 80, 100);

    // Topic
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    
    // Wrap Topic
    const words = topic.split(' ');
    let line = '';
    let y = 160;
    for (const w of words) {
      const test = line + w + ' ';
      if (ctx.measureText(test).width > 560) {
        ctx.fillText(line, 80, y);
        line = w + ' ';
        y += 44;
      } else {
        line = test;
      }
    }
    ctx.fillText(line, 80, y);

    // Divider
    y += 24;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(80, y, 560, 2);

    // Description
    y += 40;
    ctx.fillStyle = '#475569';
    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    const descWords = description.split(' ');
    let descLine = '';
    for (const w of descWords) {
      const test = descLine + w + ' ';
      if (ctx.measureText(test).width > 560) {
        ctx.fillText(descLine, 80, y);
        descLine = w + ' ';
        y += 34;
      } else {
        descLine = test;
      }
    }
    ctx.fillText(descLine, 80, y);

    // Generate QR Stamp on canvas bottom right
    QRCode.toDataURL(sourceUrl, { width: 110, margin: 1 }, (err, url) => {
      if (!err && url) {
        const qrImg = new Image();
        qrImg.onload = () => {
          ctx.drawImage(qrImg, 530, 530, 110, 110);
        };
        qrImg.src = url;
      }
    });

    // Footer brand
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Google AI Edge Gallery', 80, 620);
  }, [topic, description, sourceUrl]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `til-${topic.slice(0, 15).replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Today I Learned Card</h4>
            <p className="text-xs text-slate-400">High-res vector canvas infographic generator</p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export PNG
        </button>
      </div>

      <div className="flex justify-center bg-slate-950 p-3 rounded-lg border border-slate-800">
        <canvas ref={canvasRef} className="max-w-full h-auto w-80 rounded-lg shadow-lg" />
      </div>
    </div>
  );
};
