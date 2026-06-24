import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

interface PhotoCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function PhotoCapture({ onCapture, onClose }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function getDevices() {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true }); // Ask permission first
        setError('');
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          // Try to select an external camera if available, otherwise default to first
          const external = videoDevices.find(d => d.label.toLowerCase().includes('external') || d.label.toLowerCase().includes('usb'));
          setSelectedDeviceId(external ? external.deviceId : videoDevices[0].deviceId);
        }
      } catch (err: any) {
        console.error("Error enumerating devices:", err);
        setError('Camera permission denied or camera not found. Please allow camera access and try again.');
      }
    }
    getDevices();
  }, []);

  useEffect(() => {
    if (!selectedDeviceId) return;
    
    async function startStream() {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedDeviceId } }
        });
        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (err) {
        console.error("Error starting stream:", err);
      }
    }
    startStream();

    // Cleanup function
    return () => {
        // stream cleanup is handled in the next useEffect or on component unmount
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeviceId]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
            onCapture(file);
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-4 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Camera className="w-5 h-5" /> Take Photo
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-4">
            {error}
          </div>
        )}
        
        {!error && (
          <>
            {devices.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Select Camera</label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
                >
                  {devices.map(d => (
                    <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId}`}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-gray-200 mb-4">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
            </div>
          </>
        )}
        
        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-2">
          {!error && (
            <button 
              type="button"
              onClick={handleCapture} 
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" /> Capture
            </button>
          )}
          <button 
            type="button"
            onClick={onClose} 
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
