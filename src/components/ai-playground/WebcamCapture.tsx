import React, { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, X, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ErrorRecoveryDialog } from './ErrorRecoveryDialog';

interface WebcamCaptureProps {
  onCapture: (imageData: { file: File; preview: string }) => void;
  onClose: () => void;
  category: string;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({
  onCapture,
  onClose,
  category
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
    };
  }, []);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsReady(true);
          toast.success('📸 Webcam ready! Click capture to take photos.');
        };
      }

      setStream(mediaStream);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      
      let message = 'Could not access your camera. ';
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          message += 'Please allow camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          message += 'No camera found on this device.';
        } else {
          message += 'Make sure your camera is not being used by another application.';
        }
      }
      
      setErrorMessage(message);
      setShowError(true);
      toast.error('Camera access failed');
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], `webcam-${category}-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });
      const preview = URL.createObjectURL(blob);

      onCapture({ file, preview });
      setCaptureCount(prev => prev + 1);
      
      // Visual feedback
      const flash = document.createElement('div');
      flash.style.cssText = `
        position: fixed;
        inset: 0;
        background: white;
        opacity: 0.8;
        pointer-events: none;
        z-index: 9999;
      `;
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 100);

      toast.success(`📸 Photo ${captureCount + 1} captured!`);
    }, 'image/jpeg', 0.95);
  };

  return (
    <>
      <ErrorRecoveryDialog
        open={showError}
        onOpenChange={setShowError}
        errorType="camera"
        errorMessage={errorMessage}
        recoverySteps={[
          {
            title: 'Check Browser Permissions',
            description: 'Click the lock icon in your address bar and allow camera access.',
            icon: '🔒'
          },
          {
            title: 'Check Camera Availability',
            description: 'Make sure no other app is using your camera.',
            icon: '📹'
          },
          {
            title: 'Refresh and Try Again',
            description: 'After fixing permissions, refresh the page and try again.',
            icon: '🔄'
          }
        ]}
        onRetry={() => {
          setShowError(false);
          startWebcam();
        }}
        alternativePath={{
          label: 'Upload Photos Instead',
          action: onClose
        }}
      />

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Webcam Training
              </CardTitle>
              <CardDescription>
                Capture images for: <span className="font-semibold capitalize">{category}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Check className="h-3 w-3" />
                {captureCount} captured
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                aria-label="Close webcam"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              aria-label="Webcam preview"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white space-y-2">
                  <div className="animate-pulse">
                    <Camera className="h-12 w-12 mx-auto mb-2" />
                  </div>
                  <p className="text-sm">Starting camera...</p>
                </div>
              </div>
            )}

            {/* Capture overlay guide */}
            {isReady && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/30 rounded-lg" />
                <div className="absolute top-4 left-4 right-4">
                  <Card className="bg-black/50 border-white/20 backdrop-blur-sm">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2 text-white">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <div className="text-xs space-y-1">
                          <p className="font-medium">💡 Tips for best results:</p>
                          <ul className="list-disc list-inside space-y-0.5 opacity-90">
                            <li>Center the object in frame</li>
                            <li>Try different angles and positions</li>
                            <li>Capture at least 20-30 images</li>
                            <li>Vary lighting and backgrounds</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={captureImage}
              disabled={!isReady}
              className="flex-1 gap-2"
              size="lg"
              tabIndex={0}
              aria-label="Capture photo from webcam"
            >
              <Camera className="h-5 w-5" />
              Capture Photo
              <kbd className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded">Space</kbd>
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              tabIndex={0}
              aria-label="Done with webcam"
            >
              Done
            </Button>
          </div>

          <Card className="bg-blue-50 border-blue-200 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Keyboard shortcut:</p>
                <p>Press <kbd className="px-1.5 py-0.5 bg-blue-100 rounded border border-blue-300 font-mono">Space</kbd> to quickly capture photos!</p>
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>
    </>
  );
};

// Add keyboard shortcut support
export const useWebcamKeyboardShortcut = (onCapture: () => void, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        onCapture();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onCapture, enabled]);
};
