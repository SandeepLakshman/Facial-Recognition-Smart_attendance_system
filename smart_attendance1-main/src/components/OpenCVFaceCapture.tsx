import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Camera, CheckCircle, ArrowLeft, User, Brain } from "lucide-react";
import {
  initializeOpenCV,
  registerStudentFace,
  trainKNNModel,
  saveFaceData,
  isOpenCVModelLoaded
} from "@/lib/opencvFaceRecognition";
import { uploadFaceImage, saveFaceImageMetadata, updateStudentInFirebase, saveFaceDescriptors } from "@/lib/firebaseService";
import { updateStudent } from "@/lib/store";
// Direct Firestore access for guaranteed writes
import { db, COLLECTIONS } from "@/lib/firebase";
import { doc, updateDoc, Timestamp } from "firebase/firestore";

interface OpenCVFaceCaptureProps {
  studentData: {
    id: string;
    rollNumber: string;
    name: string;
    email: string;
  };
  onComplete: () => void;
  onBack: () => void;
}

const OpenCVFaceCapture = ({ studentData, onComplete, onBack }: OpenCVFaceCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [capturedImages, setCapturedImages] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [captureStatus, setCaptureStatus] = useState("");
  const [isTraining, setIsTraining] = useState(false);
  const [capturedImageURLs, setCapturedImageURLs] = useState<string[]>([]);
  const [capturedFaceFeatures, setCapturedFaceFeatures] = useState<number[][]>([]);

  const totalImages = 50; // Reduced for OpenCV approach

  useEffect(() => {
    initializeOpenCVSystem();
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeOpenCVSystem = async () => {
    try {
      setIsModelLoading(true);
      setCaptureStatus("Initializing system...");

      const success = await initializeOpenCV();
      if (success) {
        setIsModelLoading(false);
        setIsModelLoading(false);
        setCaptureStatus("Camera ready!");
      } else {
        setCaptureStatus("Failed to initialize scanner. Please refresh.");
      }
    } catch (error) {
      console.error("Error initializing OpenCV:", error);
      setCaptureStatus("Error initializing OpenCV system");
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
    if (!isOpenCVModelLoaded()) {
      alert("OpenCV models are still loading. Please wait...");
      return;
    }

    setIsCapturing(true);
    setCapturedImages(0);
    setCaptureProgress(0);
    setCaptureStatus("Capturing face data with Haar Cascade...");

    let capturedCount = 0;
    const imageURLs: string[] = [];
    const faceFeatures: number[][] = [];
    const uploadPromises: Promise<void>[] = [];

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

            // Register face with OpenCV
            const result = await registerStudentFace(studentData.rollNumber, canvas);

            if (result.success && result.features) {
              // Store face features for Firebase
              faceFeatures.push(result.features);

              // Convert canvas to blob and upload to Firebase Storage
              const uploadPromise = new Promise<void>((resolve, reject) => {
                try {
                  canvas.toBlob(async (blob) => {
                    if (blob) {
                      try {
                        const imageURL = await uploadFaceImage(studentData.id, blob, capturedCount);
                        imageURLs.push(imageURL);
                        setCapturedImageURLs([...imageURLs]);
                        resolve();
                      } catch (uploadError) {
                        console.error("Error uploading image to Firebase:", uploadError);
                        reject(uploadError);
                      }
                    } else {
                      reject(new Error("Failed to convert canvas to blob"));
                    }
                  }, "image/jpeg", 0.9);
                } catch (blobError) {
                  console.error("Error converting canvas to blob:", blobError);
                  reject(blobError);
                }
              });

              uploadPromises.push(uploadPromise);

              capturedCount++;
              setCapturedImages(capturedCount);
              setCaptureProgress((capturedCount / totalImages) * 100);
              setCaptureStatus(`Captured ${capturedCount}/${totalImages} face samples - Uploading to Firebase...`);
            } else {
              setCaptureStatus("No face detected - please position your face in the camera");
            }
          }
        }

        if (capturedCount >= totalImages) {
          clearInterval(captureInterval);
          setIsCapturing(false);
          setCaptureStatus("Waiting for image uploads to complete...");

          // Wait for all uploads to complete
          try {
            await Promise.all(uploadPromises);
            setCaptureStatus("Training KNN model and saving to Firebase...");

            // Train the KNN model
            setIsTraining(true);
            const trainingSuccess = await trainKNNModel();

            if (trainingSuccess) {
              try {
                console.log(`💾 Starting save for student: ${studentData.id}`);
                console.log(`📋 Student data:`, studentData);
                console.log(`📊 Face features count: ${faceFeatures.length}`);

                // DIRECT FIREBASE WRITE - bypassing all service layers for reliability
                const studentRef = doc(db, COLLECTIONS.STUDENTS, studentData.id);

                // Build faceDescriptors object (same format as saveFaceDescriptors)
                const descriptorsObject: Record<string, number[]> = {};
                faceFeatures.forEach((desc, index) => {
                  descriptorsObject[`desc_${index}`] = desc;
                });

                console.log(`🔄 Writing directly to Firestore...`);
                console.log(`📍 Document path: ${COLLECTIONS.STUDENTS}/${studentData.id}`);

                await updateDoc(studentRef, {
                  faceDescriptors: descriptorsObject,
                  faceDescriptorCount: faceFeatures.length,
                  faceRegistered: true,
                  updatedAt: Timestamp.now()
                });

                console.log(`✅ DIRECT WRITE SUCCESS! Face data saved to Firebase!`);

                // Save face data locally for recognition
                saveFaceData();
                console.log(`✅ Local face data saved!`);

                setCaptureStatus("Face registration completed successfully!");
                setTimeout(() => {
                  alert("✅ Face registration completed! Your face ID is now active.");
                  onComplete();
                }, 500);
              } catch (firebaseError: any) {
                console.error("❌ DIRECT FIREBASE WRITE FAILED:", firebaseError);
                console.error("❌ Error code:", firebaseError?.code);
                console.error("❌ Error message:", firebaseError?.message);

                // Show detailed error to user
                const errorMsg = firebaseError?.code === 'permission-denied'
                  ? "Permission denied - please update Firestore rules in Firebase Console"
                  : firebaseError?.message || "Failed to save";

                setCaptureStatus(`Error: ${errorMsg}`);
                alert(`❌ Error: ${errorMsg}\n\nCheck browser console for details.`);
              }
            } else {
              setCaptureStatus("Error training the model");
            }
            setIsTraining(false);
          } catch (uploadError: any) {
            console.error("Error uploading images:", uploadError);
            setCaptureStatus(`Error uploading images: ${uploadError?.message || "Unknown error"}`);
            setIsTraining(false);
          }
        }
      } catch (error) {
        console.error("Error during face capture:", error);
        setCaptureStatus("Error during face capture");
      }
    }, 300); // Capture every 300ms
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
          </div>
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Face Registration</CardTitle>
          <CardDescription className="text-lg">
            Position your face in the circle to register for attendance.
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
                    className={`border-2 border-dashed w-48 h-48 rounded-full flex items-center justify-center ${isCapturing ? 'border-accent animate-pulse' : 'border-muted-foreground/50'
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
                      Preparing Face Scanner...
                    </div>
                  </div>
                )}
                {isTraining && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      Training KNN model...
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
                    Hold your device steady
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Ensure good lighting
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Keep your face within the circle
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Wait for progress to reach 100%
                  </li>
                </ul>
              </div>

              {captureProgress === 100 && !isTraining && (
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-accent" />
                    <div>
                      <p className="font-semibold text-accent">Registration Complete!</p>
                      <p className="text-sm text-muted-foreground">
                        KNN model trained and ready for recognition
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
                disabled={isModelLoading}
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
                This will take about {Math.ceil((totalImages - capturedImages) * 0.3)} seconds
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OpenCVFaceCapture;
