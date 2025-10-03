import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { ErrorRecoveryDialog } from './ErrorRecoveryDialog';

interface WebcamCaptureProps {
  onCapture: (imageDataUrl: string) => void;
}

export const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture }) => {
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

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        onCapture(imageDataUrl);
        setCaptureCount(prev => prev + 1);
      }
    }
  }, [onCapture]);

  // Keyboard shortcut
  useEffect(() => {
    if (!isReady) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        captureImage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [captureImage, isReady]);

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
      />

      <div className="space-y-4">
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
                          <li>Try different angles</li>
                          <li>Capture 20-30 images</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {captureCount > 0 && (
                <div className="absolute bottom-4 right-4">
                  <Badge variant="secondary" className="gap-1 bg-white/90">
                    <Check className="h-3 w-3" />
                    {captureCount} captured
                  </Badge>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button
            onClick={captureImage}
            disabled={!isReady}
            className="w-full gap-2"
            size="lg"
            tabIndex={0}
            aria-label="Capture photo from webcam"
          >
            <Camera className="h-5 w-5" />
            Hold to Capture
            <kbd className="ml-2 px-2 py-0.5 text-xs bg-white/20 rounded">Space</kbd>
          </Button>

          <Card className="bg-blue-50 border-blue-200 p-2">
            <CardDescription className="text-xs text-blue-800">
              💡 <strong>Pro tip:</strong> Press and hold <kbd className="px-1.5 py-0.5 bg-blue-100 rounded border border-blue-300 font-mono text-xs">Space</kbd> to rapidly capture multiple photos!
            </CardDescription>
          </Card>
        </div>
      </div>
    </>
  );
};
