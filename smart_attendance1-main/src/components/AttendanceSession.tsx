import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Users, Clock, Scan } from "lucide-react";
import { recognizeFaces, isFaceModelLoaded, getDebugInfo, loadFaceModels, loadFaceDescriptorsFromFirebase } from "@/lib/faceRecognition";
import { ensureDemoSeed } from "@/lib/store";

interface AttendanceSessionProps {
  onStudentDetected: (student: any) => void;
  detectedStudents: any[];
  sectionId?: string;
}

// Pull students from Firebase
const getRegisteredStudents = async (): Promise<any[]> => {
  try {
    const { getAllStudents } = await import("@/lib/firebaseService");
    const students = await getAllStudents();
    return students.filter(s => s.faceRegistered);
  } catch (error) {
    console.error("Error getting registered students:", error);
    return [];
  }
};

const AttendanceSession = ({ onStudentDetected, detectedStudents, sectionId }: AttendanceSessionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [manualDetectionEnabled, setManualDetectionEnabled] = useState(true);
  const [detectionIntervalRef, setDetectionIntervalRef] = useState<NodeJS.Timeout | null>(null);
  const [faceBoxes, setFaceBoxes] = useState<Array<{ studentId: string; name: string; box: { x: number; y: number; width: number; height: number }; confidence: number; isRecognized: boolean }>>([]);

  useEffect(() => {
    // Initialize demo data
    (async () => {
      try {
        await ensureDemoSeed();
      } catch (error) {
        console.error("Error seeding demo data:", error);
      }
    })();

    // Log demo students for debugging
    const students = getRegisteredStudents();
    console.log('📚 Available students for detection:', students);
    setDebugLogs(prev => [...prev, `📚 ${students} students available for detection`]);

    startCamera();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Load face recognition models
    const initializeModels = async () => {
      try {
        console.log('🔄 Loading face recognition models...');
        setDebugLogs(prev => [...prev, 'Loading face recognition models...']);

        // Check if face-api is available
        if (typeof window !== 'undefined' && typeof (window as any).faceapi === 'undefined') {
          setDebugLogs(prev => [...prev, '❌ Face API not loaded. Waiting for script...']);
          // Wait a bit and try again
          setTimeout(() => initializeModels(), 2000);
          return;
        }

        const success = await loadFaceModels();
        if (success) {
          // Check if verification loaded data
          const currentDebug = getDebugInfo();

          // Correct Logic: Always try to load descriptors
          // If sectionId is present, we optimize by loading only for that section
          // Otherwise, we load all (or handled by the function internally to load all)

          setDebugLogs(prev => [...prev, `🔄 Loading face descriptors from Firebase${sectionId ? ` for section ${sectionId}` : ''}...`]);

          // Force load descriptors
          await loadFaceDescriptorsFromFirebase(sectionId);

          const debugInfo = getDebugInfo();
          setIsModelLoaded(true);
          setDebugLogs(prev => [...prev, '✅ Face recognition models loaded successfully']);
          setDebugLogs(prev => [...prev, `✅ Face descriptors loaded: ${debugInfo.registeredStudents.length} students`]);

          if (debugInfo.registeredStudents.length === 0) {
            setDebugLogs(prev => [...prev, '⚠️ WARNING: No face descriptors found. Please ensure students are registered in this section.']);
          }
          console.log('✅ Face recognition models loaded successfully');
        } else {
          setDebugLogs(prev => [...prev, '❌ Failed to load face recognition models']);
          setDebugLogs(prev => [...prev, '⚠️ Using fallback detection mode']);
          console.error('❌ Failed to load face recognition models');
          // Set a fallback mode
          setIsModelLoaded(true);
        }
      } catch (error) {
        console.error('❌ Error loading face models:', error);
        setDebugLogs(prev => [...prev, `❌ Error: ${error}`]);
      }
    };

    initializeModels();

    return () => {
      clearInterval(timer);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Use ref to avoid stale closure in setInterval
  const onStudentDetectedRef = useRef(onStudentDetected);

  useEffect(() => {
    onStudentDetectedRef.current = onStudentDetected;
  }, [onStudentDetected]);

  // Separate effect to handle detection interval based on scanning state
  useEffect(() => {
    if (!isScanning || !isModelLoaded) {
      if (detectionIntervalRef) {
        clearInterval(detectionIntervalRef);
        setDetectionIntervalRef(null);
      }
      return;
    }

    console.log('🟢 Creating new detection interval...');

    const detectionInterval = setInterval(async () => {
      if (!isModelLoaded || !isScanning || !videoRef.current || !canvasRef.current) {
        return;
      }

      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);

          let recognitions: Array<{ studentId: string; confidence: number; box: { x: number; y: number; width: number; height: number }; isRecognized: boolean }> = [];

          try {
            if (typeof window !== 'undefined' && window.faceapi && isFaceModelLoaded()) {
              recognitions = await recognizeFaces(canvas);
            }
          } catch (error) {
            console.error('Face recognition error:', error);
          }

          // Update face boxes state
          const pool = await getRegisteredStudents();
          const videoRect = video.getBoundingClientRect();
          const scaleX = videoRect.width / video.videoWidth;
          const scaleY = videoRect.height / video.videoHeight;

          const boxes = recognitions.map(recognition => {
            const student = recognition.isRecognized
              ? pool.find(s => s.rollNumber === recognition.studentId)
              : null;
            return {
              studentId: recognition.isRecognized ? recognition.studentId : 'unknown',
              name: student ? student.name : 'Unknown',
              box: {
                x: recognition.box.x * scaleX,
                y: recognition.box.y * scaleY,
                width: recognition.box.width * scaleX,
                height: recognition.box.height * scaleY
              },
              confidence: recognition.confidence,
              isRecognized: recognition.isRecognized
            };
          });
          setFaceBoxes(boxes);

          // Only trigger onStudentDetected for recognized faces with good confidence
          for (const recognition of recognitions) {
            if (recognition.isRecognized && recognition.confidence > 0.45) {
              const student = pool.find(s => s.rollNumber === recognition.studentId);
              if (student) {
                // Call the latest callback via ref
                onStudentDetectedRef.current({
                  id: student.id, // Pass Firestore ID for linking
                  rollNumber: student.rollNumber,
                  name: student.name,
                  confidence: recognition.confidence,
                  timestamp: new Date().toISOString()
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error during face recognition:", error);
      }
    }, 1000);

    setDetectionIntervalRef(detectionInterval);

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
      setDetectionIntervalRef(null);
    };
  }, [isScanning, isModelLoaded]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Video ready:', {
            width: videoRef.current?.videoWidth,
            height: videoRef.current?.videoHeight
          });
          setDebugLogs(prev => [...prev.slice(-4), `✅ Camera ready: ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`]);
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setDebugLogs(prev => [...prev.slice(-4), `❌ Camera error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-elevation">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Live Attendance Session</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
              {isScanning && (
                <div className="flex items-center space-x-1">
                  <Scan className="h-4 w-4 animate-pulse text-accent" />
                  <span className="text-accent">Scanning...</span>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Camera Feed */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Hidden canvas for face recognition */}
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />

                {/* Face detection overlays */}
                <div className="absolute inset-0 pointer-events-none">
                  {faceBoxes.map((faceBox, index) => (
                    <div
                      key={`${faceBox.studentId}-${index}`}
                      className={`absolute border-2 rounded z-10 ${faceBox.isRecognized
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-yellow-500 bg-yellow-500/10'
                        }`}
                      style={{
                        left: `${faceBox.box.x}px`,
                        top: `${faceBox.box.y}px`,
                        width: `${faceBox.box.width}px`,
                        height: `${faceBox.box.height}px`
                      }}
                    >
                      <div className={`absolute -bottom-6 left-0 text-white text-xs px-2 py-1 rounded whitespace-nowrap font-medium shadow-lg z-20 ${faceBox.isRecognized ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                        {faceBox.name} {faceBox.isRecognized && `(${Math.round(faceBox.confidence * 100)}%)`}
                      </div>
                    </div>
                  ))}

                  {/* Scanning grid overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 ${!isScanning ? 'opacity-50' : ''}`} />
                  <div className={`absolute inset-4 border border-dashed border-primary/30 rounded-lg ${!isScanning ? 'border-red-500' : ''}`} />

                  {/* Status indicator */}
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-lg text-sm font-medium ${isScanning
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600 text-white'
                    }`}>
                    {isScanning ? '🟢 Scanning Active' : '⏸️ Detection Paused'}
                  </div>

                  {/* Control buttons */}
                  <div className="absolute bottom-4 left-4 flex space-x-2 pointer-events-auto">
                    <button
                      onClick={async () => {
                        if (!videoRef.current || !canvasRef.current || !isModelLoaded) {
                          setDebugLogs(prev => [...prev.slice(-4), '❌ Cannot detect: Camera or models not ready']);
                          return;
                        }

                        try {
                          setDebugLogs(prev => [...prev.slice(-4), '🎯 Manual detection triggered...']);
                          const canvas = canvasRef.current;
                          const video = videoRef.current;
                          const ctx = canvas.getContext('2d');

                          if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            ctx.drawImage(video, 0, 0);

                            const recognitions = await recognizeFaces(canvas);
                            const pool = await getRegisteredStudents();

                            if (recognitions.length > 0) {
                              setDebugLogs(prev => [...prev.slice(-4), `✅ Detected ${recognitions.length} face(s)`]);

                              // Simple face box calculation
                              if (video.videoWidth > 0 && video.videoHeight > 0) {
                                const videoRect = video.getBoundingClientRect();
                                const scaleX = videoRect.width / video.videoWidth;
                                const scaleY = videoRect.height / video.videoHeight;

                                const boxes = recognitions.map(recognition => {
                                  const student = recognition.isRecognized
                                    ? pool.find(s => s.rollNumber === recognition.studentId)
                                    : null;

                                  return {
                                    studentId: recognition.isRecognized ? recognition.studentId : 'unknown',
                                    name: student ? student.name : 'Unknown',
                                    box: {
                                      x: recognition.box.x * scaleX,
                                      y: recognition.box.y * scaleY,
                                      width: recognition.box.width * scaleX,
                                      height: recognition.box.height * scaleY
                                    },
                                    confidence: recognition.confidence,
                                    isRecognized: recognition.isRecognized
                                  };
                                });

                                setFaceBoxes(boxes);
                              }

                              // Trigger onStudentDetected for recognized faces
                              for (const recognition of recognitions) {
                                if (recognition.isRecognized && recognition.confidence > 0.4) {
                                  const student = pool.find(s => s.rollNumber === recognition.studentId);
                                  if (student) {
                                    onStudentDetected({
                                      rollNumber: student.rollNumber,
                                      name: student.name,
                                      confidence: recognition.confidence,
                                      timestamp: new Date().toISOString()
                                    });
                                  }
                                }
                              }
                            } else {
                              setDebugLogs(prev => [...prev.slice(-4), '⚠️ No faces detected']);
                            }
                          }
                        } catch (error) {
                          console.error('Manual detection error:', error);
                          setDebugLogs(prev => [...prev.slice(-4), `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
                        }
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors z-10 shadow-lg"
                    >
                      🎯 Detect Now
                    </button>

                    <button
                      onClick={() => {
                        const newScanningState = !isScanning;
                        setIsScanning(newScanningState);

                        // Force clear any existing interval
                        if (detectionIntervalRef) {
                          clearInterval(detectionIntervalRef);
                          setDetectionIntervalRef(null);
                        }

                        setDebugLogs(prev => [...prev.slice(-4), newScanningState ? '▶️ Detection started' : '⏸️ Detection stopped']);
                        console.log(`Detection ${newScanningState ? 'started' : 'stopped'}`);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors z-10 shadow-lg ${isScanning
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      {isScanning ? '⏸️ Stop' : '▶️ Start'}
                    </button>

                    <button
                      onClick={() => {
                        // Clear all detected students and face boxes
                        setFaceBoxes([]);
                        setDebugLogs(prev => [...prev.slice(-4), '🗑️ Cleared all detected students']);
                        // Note: We can't directly clear parent's detectedStudents, but we clear the visual feedback
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors z-10 shadow-lg"
                    >
                      🗑️ Clear All
                    </button>
                  </div>

                  {/* Model loading indicator */}
                  {!isModelLoaded && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        Loading face recognition models...
                      </div>
                    </div>
                  )}

                  {/* Debug info overlay */}
                  {isModelLoaded && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-2 rounded">
                      <div>Models: ✅ Loaded</div>
                      <div>Students: {getDebugInfo().registeredStudents.length}</div>
                      <div>Descriptors: {getDebugInfo().totalDescriptors}</div>
                      {getDebugInfo().registeredStudents.length === 0 && (
                        <div className="mt-1 text-yellow-300 text-[10px]">
                          ⚠️ No face data loaded
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>AI is continuously scanning for registered faces</p>
                <p>Students will be automatically marked present when detected</p>
              </div>
            </div>

            {/* Detection Stats */}
            <div className="space-y-4">
              <Card className="bg-gradient-card shadow-card">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {detectedStudents.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Students Present</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Detected Students</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {detectedStudents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center">
                        No students detected yet
                      </p>
                    ) : (
                      detectedStudents.map((student) => (
                        <div
                          key={student.rollNumber}
                          className="flex items-center justify-between p-2 bg-muted/30 rounded border"
                        >
                          <div>
                            <div className="font-medium text-sm">{student.name}</div>
                            <div className="text-xs text-muted-foreground">{student.rollNumber}</div>
                          </div>
                          <Badge className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs">
                            Present
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Debug Panel */}
              <Card className="shadow-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <Scan className="h-4 w-4" />
                    <span>Debug Logs</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
                    {debugLogs.length === 0 ? (
                      <p className="text-muted-foreground text-center">
                        No logs yet
                      </p>
                    ) : (
                      debugLogs.map((log, index) => (
                        <div key={index} className="text-xs font-mono bg-muted/30 p-1 rounded">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceSession;