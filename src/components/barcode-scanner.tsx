
"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCcw, Landmark, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  const startScanner = async () => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode("reader");
    }

    const config = {
      fps: 20,
      qrbox: { width: 280, height: 180 },
      aspectRatio: 1.0,
    };

    try {
      await html5QrCodeRef.current.start(
        { facingMode },
        config,
        (decodedText: string) => {
          onScan(decodedText);
          handleClose();
        },
        () => { } // ignore video frame errors
      );
      setIsScanning(true);
      setHasCameraPermission(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Scanner Error',
        description: 'Could not start camera. Please check permissions.',
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the DOM element #reader is mounted
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }
  }, [isOpen, facingMode]);

  const toggleCamera = () => {
    stopScanner().then(() => {
      setFacingMode((prev: "user" | "environment") => prev === "user" ? "environment" : "user");
    });
  };

  const handleClose = () => {
    stopScanner().then(() => {
      onClose();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] border-none bg-slate-900 text-white overflow-hidden p-0 rounded-[2rem]">
        <div className="p-8 pb-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold font-headline text-white">
              <div className="p-2 bg-primary/20 rounded-xl">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              Live Scanner
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              Point your camera at a product's barcode for instant scanning.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="relative aspect-[4/3] bg-black overflow-hidden group">
          <div id="reader" className="w-full h-full object-cover" />

          {/* Custom Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            {/* Corner Borders */}
            <div className="relative w-[280px] h-[180px]">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />

              {/* Scanning Animation Line */}
              {isScanning && (
                <div className="absolute top-0 left-2 right-2 h-[2px] bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)] animate-[scan_2s_linear_infinite]" />
              )}
            </div>

            <p className="mt-8 text-xs font-bold text-white/60 tracking-[0.2em] uppercase">
              Align barcode within frame
            </p>
          </div>

          {!isScanning && hasCameraPermission !== false && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <RefreshCcw className="w-8 h-8 text-primary animate-spin" />
                <span className="text-sm font-bold text-white/80">Initializing Camera...</span>
              </div>
            </div>
          )}

          {hasCameraPermission === false && (
            <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-900/95 backdrop-blur-md">
              <Alert className="bg-red-500/10 border-red-500/50 text-red-200 rounded-3xl p-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <Camera className="w-12 h-12 text-red-400" />
                  <div>
                    <AlertTitle className="text-xl font-bold mb-2 text-white">Camera Access Required</AlertTitle>
                    <AlertDescription className="text-red-200/80 font-medium">
                      Please allow camera access in your browser settings to use the live scanner.
                    </AlertDescription>
                  </div>
                  <Button variant="outline" onClick={() => window.location.reload()} className="border-red-500/50 text-red-200 hover:bg-red-500 hover:text-white rounded-xl">
                    Retry Access
                  </Button>
                </div>
              </Alert>
            </div>
          )}
        </div>

        <div className="p-8 flex gap-3">
          <Button
            variant="secondary"
            onClick={toggleCamera}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/10 rounded-2xl py-6 font-bold"
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> Switch Camera
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1 border-white/10 text-slate-400 hover:bg-white/5 hover:text-white rounded-2xl py-6 font-bold"
          >
            Close
          </Button>
        </div>

        <style jsx global>{`
          @keyframes scan {
            0% { top: 0%; opacity: 0; }
            5% { opacity: 1; }
            95% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          #reader video {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
