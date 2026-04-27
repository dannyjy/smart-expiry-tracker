
import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Scan, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function Scanner({ onScan, onClose }: ScannerProps) {
  const [lastScan, setLastScan] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render((decodedText) => {
      setLastScan(decodedText);
      onScan(decodedText);
      scanner.clear();
    }, (error) => {
      // console.warn(error);
    });

    return () => {
      scanner.clear().catch(e => console.error("Failed to clear scanner", e));
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800">Barcode/QR Scanner</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <div className="p-6">
          <div id="reader" className="overflow-hidden rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 min-h-[300px] flex items-center justify-center relative">
             {/* Overlay for aesthetic */}
             <div className="absolute inset-0 border-4 border-indigo-500/20 pointer-events-none rounded-xl" />
          </div>
          
          <div className="mt-6 flex flex-col items-center text-center">
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 w-full">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Status</p>
              {lastScan ? (
                <div className="flex items-center justify-center gap-2 text-indigo-900 font-mono text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  Captured: {lastScan}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-medium">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  Searching for codes...
                </div>
              )}
            </div>
            
            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed max-w-xs">
              Position the barcode or QR code inside the frame. The system will automatically detect and capture the data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
