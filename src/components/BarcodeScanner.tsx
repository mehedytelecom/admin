import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanType, Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

interface BarcodeScannerProps {
  onResult: (result: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onResult, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!scannerRef.current) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: {width: 250, height: 100}, supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onResult(decodedText);
      },
      (errorMessage) => {
        // setError(errorMessage);
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onResult]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-4 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Camera className="w-5 h-5" /> Camera Scanner
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div id="reader" ref={scannerRef} className="w-full h-full min-h-[300px] overflow-hidden rounded-xl border border-gray-200"></div>
        
        <p className="text-xs text-gray-500 text-center mt-3">Position the barcode inside the frame to scan.</p>
        <button onClick={onClose} className="w-full mt-4 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
