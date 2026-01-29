
import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, XCircle, LogOut, Camera, Calendar, User, History, Zap, TrendingUp, BookOpen, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getActiveSessionForSection,
  getAttendanceForStudent,
  getStudentFromFirebase,
  findStudentByRollNumber,
  subscribeToAttendance
} from "@/lib/firebaseService";
import { Session, Student, AttendanceRecord } from "@/lib/store";
import OpenCVAttendanceSystem from "@/components/OpenCVAttendanceSystem";
import OpenCVFaceCapture from "@/components/OpenCVFaceCapture";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StudentDashboardProps {
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onLogout }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [studentProfile, setStudentProfile] = useState<Student | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [sectionName, setSectionName] = useState<string>("");

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;
    let unsubscribeAttendance: (() => void) | undefined;

    const init = async () => {
      if (currentUser?.id && currentUser.role === 'student') {
        // Profile Listener
        try {
          const { doc, onSnapshot } = await import("firebase/firestore");
          const { db, COLLECTIONS } = await import("@/lib/firebase");

          unsubscribeProfile = onSnapshot(doc(db, COLLECTIONS.STUDENTS, currentUser.id), (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as Student;
              setStudentProfile({ ...data, id: docSnap.id });
            }
          });
        } catch (e) {
          console.error("Error setting up profile listener:", e);
          if (currentUser.data) setStudentProfile(currentUser.data as Student);
        }

        // Initial Data Load (Fallback/Speed)
        // We load this first to ensure data appears immediately while subscription connects
        try {
          const history = await getAttendanceForStudent(currentUser.id);
          const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
          setAttendanceHistory(sorted);
        } catch (e) {
          console.error("Error fetching initial history:", e);
        }

        // Attendance Listener
        unsubscribeAttendance = subscribeToAttendance(currentUser.id, (records) => {
          // Sort by timestamp desc
          const sorted = [...records].sort((a, b) => b.timestamp - a.timestamp);
          setAttendanceHistory(sorted);

          if (activeSession) {
            const hasMarked = sorted.some(log =>
              log.sectionId === activeSession.sectionId &&
              log.subjectId === activeSession.subjectId &&
              log.timestamp > (Date.now() - 60 * 60 * 1000)
            );
            setAttendanceMarked(hasMarked);
          }
        });

        // Active Session Check
        const sectionId = (currentUser.data as Student).sectionId;
        if (sectionId) {
          setSectionName(sectionId);
          const session = await getActiveSessionForSection(sectionId);
          setActiveSession(session);
        }
      } else {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeAttendance) unsubscribeAttendance();
    };
  }, [currentUser, activeSession]);

  useEffect(() => {
    if (studentProfile) setLoading(false);
  }, [studentProfile]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleAttendanceSuccess = () => {
    setMarkingAttendance(false);
    setAttendanceMarked(true);
    // History will update via subscription
  };

  // Group history by date
  const groupedHistory = useMemo(() => {
    const groups: { [key: string]: AttendanceRecord[] } = {};
    attendanceHistory.forEach(record => {
      const date = new Date(record.timestamp).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(record);
    });
    return groups;
  }, [attendanceHistory]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-blue-500" />
        <p className="text-zinc-400">Loading Dashboard...</p>
      </div>
    </div>
  );

  const totalClasses = attendanceHistory.length;
  const attendedClasses = attendanceHistory.filter(r => r.present).length;
  const missedClasses = totalClasses - attendedClasses;
  const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

  // Determine health color
  const healthColor = attendancePercentage >= 75 ? "text-green-500" : attendancePercentage >= 60 ? "text-yellow-500" : "text-red-500";
  const progressColor = attendancePercentage >= 75 ? "bg-green-500" : attendancePercentage >= 60 ? "bg-yellow-500" : "bg-red-500";

  // Face Registration View
  if (showRegistration && studentProfile) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <OpenCVFaceCapture
          studentData={{
            id: currentUser?.id || "",
            rollNumber: studentProfile.rollNumber,
            name: studentProfile.name,
            email: studentProfile.email
          }}
          onComplete={() => {
            setShowRegistration(false);
            setStudentProfile(prev => prev ? ({ ...prev, faceRegistered: true }) : null);
          }}
          onBack={() => setShowRegistration(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans selection:bg-blue-500/30">

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col pb-20">

        {/* Header */}
        <header className="px-6 py-6 flex justify-between items-start">
          <div>
            <p className="text-zinc-400 text-sm font-medium mb-1">Good Morning,</p>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              {studentProfile?.name?.split(' ')[0] || currentUser?.name?.split(' ')[0] || "Student"}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-zinc-800/50 hover:bg-zinc-800 border-zinc-700 text-zinc-300">
                {sectionName.length > 10 ? "Section" : sectionName}
              </Badge>
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                {studentProfile?.rollNumber}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full">
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        {/* Missing Face Alert */}
        {studentProfile && !studentProfile.faceRegistered && (
          <div className="px-6 mb-6">
            <Alert className="bg-red-950/30 border-red-900/50 text-red-200 backdrop-blur-sm">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertTitle className="text-red-400 font-semibold mb-1">Face ID Required</AlertTitle>
              <AlertDescription className="text-red-200/80 text-xs mb-3">
                Register your face to mark attendance.
              </AlertDescription>
              <Button
                size="sm"
                className="w-full bg-red-600 hover:bg-red-700 text-white border-0"
                onClick={() => setShowRegistration(true)}
              >
                <Camera className="w-4 h-4 mr-2" />
                Register Face
              </Button>
            </Alert>
          </div>
        )}

        <div className="px-6 space-y-6">

          {/* Main Stats Card */}
          <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-xl shadow-xl overflow-hidden relative group">
            <div className={`absolute top-0 left-0 w-1 h-full ${progressColor}`} />
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-1">Overall Attendance</p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${healthColor}`}>{attendancePercentage}%</span>
                    <span className="text-zinc-500 text-sm font-medium">accuracy</span>
                  </div>
                </div>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center bg-zinc-800/50 border border-zinc-700/50 ${healthColor}`}>
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-400 mb-1">
                  <span>Progress</span>
                  <span>Target: 75%</span>
                </div>
                <Progress value={attendancePercentage} className="h-2 bg-zinc-800" indicatorClassName={progressColor} />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-zinc-800/50">
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Attended</p>
                  <p className="text-white font-semibold flex items-center">
                    <CheckCircle2 className="h-3 w-3 text-green-500 mr-1.5" />
                    {attendedClasses} Classes
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Missed</p>
                  <p className="text-white font-semibold flex items-center">
                    <XCircle className="h-3 w-3 text-red-500 mr-1.5" />
                    {missedClasses} Classes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Session / Pulse */}
          {activeSession ? (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <Card className="relative bg-zinc-900/80 border-green-500/30 backdrop-blur-xl">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20 mb-2 pl-1 pr-2 gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          Live Session
                        </Badge>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          {activeSession.subjectId}
                          <span className="text-zinc-500 text-sm font-normal">({activeSession.sectionId})</span>
                        </h3>
                      </div>
                      <div className="bg-zinc-800 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-green-400" />
                      </div>
                    </div>

                    {!attendanceMarked ? (
                      <Dialog open={markingAttendance} onOpenChange={setMarkingAttendance}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold h-12 shadow-lg shadow-green-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <Camera className="h-5 w-5 mr-2" />
                            Mark Present
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-black border-zinc-800 p-0 overflow-hidden text-white">
                          <OpenCVAttendanceSystem
                            onSuccess={handleAttendanceSuccess}
                            mode="student_kiosk"
                            requiredSessionId={activeSession.id}
                          />
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center justify-center text-green-400 font-medium">
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Marked Present
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="bg-zinc-900/20 border-zinc-800/50 border-dashed backdrop-blur-sm">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
                  <Zap className="h-6 w-6 text-zinc-600" />
                </div>
                <p className="text-zinc-400 font-medium">No Active Sessions</p>
                <p className="text-zinc-600 text-xs mt-1">Check back during scheduled class times</p>
              </CardContent>
            </Card>
          )}

          {/* Timeline History */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <History className="h-4 w-4" />
              Attendance History
            </h3>

            <div className="relative border-l border-zinc-800 ml-2 space-y-8 pb-10">
              {Object.entries(groupedHistory).length === 0 ? (
                <div className="pl-6 pt-1">
                  <p className="text-zinc-600 text-sm">No history records found.</p>
                </div>
              ) : (
                Object.entries(groupedHistory).map(([date, records]) => (
                  <div key={date} className="relative pl-6">
                    {/* Timestamp Dot */}
                    <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-zinc-700 ring-4 ring-[#09090b]" />

                    <h4 className="text-sm font-semibold text-zinc-300 mb-3">{date}</h4>

                    <div className="space-y-3">
                      {records.map((record) => (
                        <div key={record.id} className="group flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-900/60 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${record.present ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{record.subjectId}</p>
                              <p className="text-xs text-zinc-500">Period {record.period || 1} • {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>

                          <Badge variant="outline" className={`${record.present
                            ? "border-green-500/30 text-green-500 bg-green-500/5"
                            : "border-red-500/30 text-red-500 bg-red-500/5"
                            }`}>
                            {record.present ? "Present" : "Absent"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;