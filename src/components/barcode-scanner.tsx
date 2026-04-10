
"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          // Stop stream immediately as Html5QrcodeScanner will manage its own camera access
          stream.getTracks().forEach(track => track.stop());
          
          initializeScanner();
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this app.',
          });
        }
      };

      const initializeScanner = () => {
        if (!scannerRef.current) {
          scannerRef.current = new Html5QrcodeScanner(
            "reader",
            { 
              fps: 10, 
              qrbox: { width: 250, height: 150 },
              formatsToSupport: [
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.QR_CODE,
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
              ]
            },
            false
          );

          scannerRef.current.render(
            (decodedText) => {
              onScan(decodedText);
              handleClose();
            },
            (errorMessage) => {
              // Ignore errors during scanning as they happen frequently
            }
          );
        }
      };

      getCameraPermission();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear scanner", error);
        });
        scannerRef.current = null;
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
      scannerRef.current = null;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary font-headline">
            <Camera className="w-5 h-5" /> Scan Barcode
          </DialogTitle>
          <DialogDescription>
            Point your camera at a product's barcode to scan it.
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-dashed border-primary/20">
          <div id="reader" className="w-full h-full" />
          
          {hasCameraPermission === false && (
            <div className="absolute inset-0 flex items-center justify-center p-6 bg-background/80">
              <Alert variant="destructive">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access to use this feature. Check your browser settings.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={handleClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
