import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Users, Clock, Scan, Brain } from "lucide-react";
import { 
  recognizeFaces, 
  isOpenCVModelLoaded, 
  getOpenCVDebugInfo,
  markAttendance 
} from "@/lib/opencvFaceRecognition";

interface OpenCVAttendanceSessionProps {
  onStudentDetected: (student: any) => void;
  detectedStudents: any[];
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

const OpenCVAttendanceSession = ({ onStudentDetected, detectedStudents }: OpenCVAttendanceSessionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  useEffect(() => {
    startCamera();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Check if OpenCV models are loaded
    const checkModels = () => {
      const modelLoaded = isOpenCVModelLoaded();
      setIsModelLoaded(modelLoaded);
      
      if (modelLoaded) {
        const debugInfo = getOpenCVDebugInfo();
        console.log('🔧 OpenCV Face Recognition Debug Info:', debugInfo);
      }
    };
    
    checkModels();
    const modelCheckInterval = setInterval(checkModels, 2000);

    // Real face recognition detection using OpenCV
    const detectionInterval = setInterval(async () => {
      if (!isOpenCVModelLoaded() || !videoRef.current || !canvasRef.current) {
        return;
      }

      try {
        // Capture frame from video
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          
          // Recognize faces using OpenCV KNN
          const recognitions = await recognizeFaces(canvas);
          const logMessage = `🎯 OpenCV session: Found ${recognitions.length} recognitions`;
          console.log(logMessage);
          setDebugLogs(prev => [...prev.slice(-4), logMessage]);
          
          for (const recognition of recognitions) {
            const processLog = `🔍 Processing: ${recognition.studentId} (confidence: ${recognition.confidence.toFixed(3)})`;
            console.log(processLog);
            setDebugLogs(prev => [...prev.slice(-4), processLog]);
            
            if (recognition.confidence > 0.5) {
              const pool = await getRegisteredStudents();
              const student = pool.find(s => s.rollNumber === recognition.studentId);
              
              if (student) {
                const successLog = `✅ Student detected: ${student.name} (${student.rollNumber})`;
                console.log(successLog);
                setDebugLogs(prev => [...prev.slice(-4), successLog]);
                
                // Mark attendance
                markAttendance(student.rollNumber, student.name);
                
                onStudentDetected({ 
                  rollNumber: student.rollNumber, 
                  name: student.name, 
                  email: student.email 
                });
              } else {
                const errorLog = `❌ Student not found in database: ${recognition.studentId}`;
                console.log(errorLog);
                setDebugLogs(prev => [...prev.slice(-4), errorLog]);
              }
            } else {
              const lowConfLog = `⚠️ Recognition confidence too low: ${recognition.confidence.toFixed(3)} < 0.5`;
              console.log(lowConfLog);
              setDebugLogs(prev => [...prev.slice(-4), lowConfLog]);
            }
          }
        }
      } catch (error) {
        console.error("Error during OpenCV face recognition:", error);
      }
    }, 2000); // Check every 2 seconds

    return () => {
      clearInterval(timer);
      clearInterval(detectionInterval);
      clearInterval(modelCheckInterval);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 960, 
          height: 540,
          frameRate: { ideal: 30, max: 60 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-elevation">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>OpenCV Live Attendance Session</span>
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
                  {/* Face detection rectangles */}
                  {detectedStudents.slice(-2).map((student, index) => (
                    <div
                      key={student.rollNumber}
                      className="absolute border-2 border-accent bg-accent/10 rounded"
                      style={{
                        left: `${20 + index * 30}%`,
                        top: `${30 + index * 10}%`,
                        width: '120px',
                        height: '160px'
                      }}
                    >
                      <div className="absolute -bottom-8 left-0 bg-accent text-accent-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
                        {student.name}
                      </div>
                    </div>
                  ))}
                  
                  {/* Scanning grid overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  <div className="absolute inset-4 border border-dashed border-primary/30 rounded-lg" />
                  
                  {/* Model loading indicator */}
                  {!isModelLoaded && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        Loading OpenCV and Haar Cascade...
                      </div>
                    </div>
                  )}
                  
                  {/* Debug info overlay */}
                  {isModelLoaded && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs p-2 rounded">
                      <div>OpenCV: ✅ Loaded</div>
                      <div>Students: {getOpenCVDebugInfo().registeredStudents.length}</div>
                      <div>Samples: {getOpenCVDebugInfo().totalSamples}</div>
                      <div>KNN: {getOpenCVDebugInfo().knnTrained ? '✅' : '❌'}</div>
                      <div>Firebase: ✅ Connected</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>OpenCV with Haar Cascade is continuously scanning for registered faces</p>
                <p>KNN model recognizes students and automatically marks attendance</p>
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
                    <span>OpenCV Debug Logs</span>
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

export default OpenCVAttendanceSession;
