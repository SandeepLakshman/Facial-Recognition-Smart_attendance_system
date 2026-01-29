import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Users, Eye } from "lucide-react";
import { loadFaceModels, detectFaces, isFaceModelLoaded } from "@/lib/faceRecognition";

const SimpleFaceDetection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [detectedFaces, setDetectedFaces] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    initializeSystem();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  const initializeSystem = async () => {
    try {
      setStatus("Loading face detection models...");
      const success = await loadFaceModels();
      
      if (success) {
        setIsModelLoading(false);
        setStatus("Face detection ready!");
        startCamera();
      } else {
        setStatus("Failed to load models");
      }
    } catch (error) {
      console.error("Error initializing:", error);
      setStatus("Error loading models");
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setStatus("Camera access denied");
    }
  };

  const startDetection = () => {
    if (!isFaceModelLoaded()) {
      setStatus("Models not loaded yet");
      return;
    }

    setIsDetecting(true);
    setStatus("Detecting faces...");
    
    detectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;

      try {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          
          const faces = await detectFaces(canvas);
          setDetectedFaces(faces.length);
          
          if (faces.length > 0) {
            setStatus(`Detected ${faces.length} face${faces.length > 1 ? 's' : ''}`);
          } else {
            setStatus("No faces detected");
          }
        }
      } catch (error) {
        console.error("Detection error:", error);
        setStatus("Detection error");
      }
    }, 1000); // Check every second
  };

  const stopDetection = () => {
    setIsDetecting(false);
    setStatus("Detection stopped");
    setDetectedFaces(0);
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Simple Face Detection</h1>
        <p className="text-lg text-muted-foreground">
          Just detects people in the camera feed
        </p>
      </div>

      <Card className="shadow-elevation">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>Live Camera Feed</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Camera Feed */}
            <div className="space-y-4">
              <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                
                {/* Loading overlay */}
                {isModelLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      {status}
                      <div className="mt-4">
                        <Button 
                          onClick={initializeSystem}
                          variant="outline"
                          size="sm"
                          className="text-white border-white hover:bg-white hover:text-black"
                        >
                          Retry Loading
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Detection overlay */}
                {!isModelLoading && (
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-sm p-2 rounded">
                    <div>Status: {status}</div>
                    <div>Faces: {detectedFaces}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls and Info */}
            <div className="space-y-6">
              <Card className="bg-gradient-card">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {detectedFaces}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Face{detectedFaces !== 1 ? 's' : ''} Detected
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Controls</h3>
                <div className="flex space-x-3">
                  {!isDetecting ? (
                    <Button 
                      onClick={startDetection}
                      className="flex-1"
                      disabled={isModelLoading}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Start Detection
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopDetection}
                      variant="destructive"
                      className="flex-1"
                    >
                      Stop Detection
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">How it works</h3>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Uses Face-API.js for face detection
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Detects faces in real-time
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Shows count of detected faces
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    No face recognition - just detection
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleFaceDetection;
