import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera, CheckCircle, ArrowLeft, User } from "lucide-react";
import { loadFaceModels, registerStudentFace, isFaceModelLoaded } from "@/lib/faceRecognition";

interface FaceCaptureProps {
  studentData: {
    id: string;
    rollNumber: string;
    name: string;
    email: string;
  };
  onComplete: () => void;
  onBack: () => void;
}

const FaceCapture = ({ studentData, onComplete, onBack }: FaceCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [capturedImages, setCapturedImages] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [captureStatus, setCaptureStatus] = useState("");

  const totalImages = 100; // Optimized for faster registration

  useEffect(() => {
    initializeFaceRecognition();
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeFaceRecognition = async () => {
    try {
      setIsModelLoading(true);
      setCaptureStatus("Loading face recognition models from CDN...");
      
      // Wait for face-api.js to be available
      let waitCount = 0;
      while (typeof window === 'undefined' || typeof (window as any).faceapi === 'undefined') {
        if (waitCount > 10) {
          setCaptureStatus("Face API library not loaded. Please refresh the page.");
          setIsModelLoading(false);
          return;
        }
        setCaptureStatus(`Waiting for Face API library... (${waitCount + 1}/10)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        waitCount++;
      }
      
      // Try loading models with retry
      let success = false;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (!success && attempts < maxAttempts) {
        attempts++;
        setCaptureStatus(`Loading face recognition models... (Attempt ${attempts}/${maxAttempts})`);
        
        try {
          success = await loadFaceModels();
          
          if (!success && attempts < maxAttempts) {
            setCaptureStatus(`Retrying in 3 seconds... (Attempt ${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error: any) {
          console.error(`Attempt ${attempts} failed:`, error);
          setCaptureStatus(`Error: ${error?.message || 'Unknown error'}. Retrying...`);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }
      
      if (success) {
        setIsModelLoading(false);
        setCaptureStatus("Face recognition ready! You can now start face capture.");
      } else {
        setCaptureStatus("Failed to load face recognition models. Please check your internet connection and refresh the page.");
        setIsModelLoading(false);
      }
    } catch (error: any) {
      console.error("Error initializing face recognition:", error);
      setCaptureStatus(`Error: ${error?.message || 'Failed to load models'}. Please refresh the page.`);
      setIsModelLoading(false);
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
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const startCapture = async () => {
    if (!isFaceModelLoaded()) {
      alert("Face recognition models are still loading. Please wait...");
      return;
    }

    setIsCapturing(true);
    setCapturedImages(0);
    setCaptureProgress(0);
    setCaptureStatus("Capturing face data...");

    let capturedCount = 0;
    const captureInterval = setInterval(async () => {
      try {
        if (videoRef.current && canvasRef.current) {
          // Capture frame from video
          const canvas = canvasRef.current;
          const video = videoRef.current;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            
            // Register face with Face API - use rollNumber as key for recognition
            const success = await registerStudentFace(studentData.rollNumber, canvas);
            
            if (success) {
              capturedCount++;
              setCapturedImages(capturedCount);
              setCaptureProgress((capturedCount / totalImages) * 100);
              setCaptureStatus(`Captured ${capturedCount}/${totalImages} face samples`);
            } else {
              setCaptureStatus("No face detected - please position your face in the camera");
            }
          }
        }

        if (capturedCount >= totalImages) {
          clearInterval(captureInterval);
          setIsCapturing(false);
          setCaptureStatus("Saving face data to Firebase...");
          
          // Save face descriptors to Firebase
          try {
            console.log(`💾 Saving face data for student: ${studentData.name} (Roll: ${studentData.rollNumber}, ID: ${studentData.id})`);
            const { saveFaceDescriptorsToFirebase } = await import("@/lib/faceRecognition");
            // Use rollNumber since that's how descriptors are stored
            await saveFaceDescriptorsToFirebase(studentData.rollNumber);
            setCaptureStatus("Face registration completed successfully!");
            setTimeout(() => {
              alert("Face registration completed successfully! Your face data has been saved to Firebase.");
              onComplete();
            }, 1000);
          } catch (error: any) {
            console.error("❌ Error saving face data:", error);
            setCaptureStatus(`Error: ${error?.message || "Failed to save to Firebase. Please try again."}`);
            alert(`Error: ${error?.message || "Face captured but failed to save. Please try again."}`);
          }
        }
      } catch (error) {
        console.error("Error during face capture:", error);
        setCaptureStatus("Error during face capture");
      }
    }, 200); // Capture every 200ms
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-elevation">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Button onClick={onBack} variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{studentData.name}</span>
            </div>
          </div>
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Facial Recognition Setup</CardTitle>
          <CardDescription className="text-lg">
            We'll capture multiple images of your face to train the recognition model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Camera Feed */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-center">Camera Feed</h3>
              <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Hidden canvas for face capture */}
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                {/* Face detection overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div 
                    className={`border-2 border-dashed w-48 h-48 rounded-full flex items-center justify-center ${
                      isCapturing ? 'border-accent animate-pulse' : 'border-muted-foreground/50'
                    }`}
                  >
                    <span className="text-xs text-center text-muted-foreground">
                      Position your face<br />within this circle
                    </span>
                  </div>
                </div>
                {isModelLoading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      Loading face recognition models...
                      <div className="mt-4">
                        <Button 
                          onClick={initializeFaceRecognition}
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
              </div>
            </div>

            {/* Progress and Instructions */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Capture Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Images Captured</span>
                    <span>{capturedImages} / {totalImages}</span>
                  </div>
                  <Progress value={captureProgress} className="h-2" />
                  {captureStatus && (
                    <div className="text-center text-sm text-muted-foreground">
                      {captureStatus}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Instructions:</h4>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Position your face within the circle
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Look directly at the camera
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Keep your face visible and well-lit
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Slightly move your head during capture
                  </li>
                </ul>
              </div>

              {captureProgress === 100 && (
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-accent" />
                    <div>
                      <p className="font-semibold text-accent">Registration Complete!</p>
                      <p className="text-sm text-muted-foreground">
                        Your facial recognition model is ready
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isCapturing && captureProgress === 0 && (
            <div className="text-center">
              <Button 
                onClick={startCapture}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                <Camera className="h-4 w-4 mr-2" />
                Start Face Capture
              </Button>
            </div>
          )}

          {isCapturing && (
            <div className="text-center">
              <p className="text-lg font-medium text-primary">
                Capturing images... Please hold still
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This will take about {Math.ceil((totalImages - capturedImages) * 0.15)} seconds
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceCapture;