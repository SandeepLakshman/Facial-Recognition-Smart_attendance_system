
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Play, Square, Users, Clock, History, LogOut, Loader2, QrCode, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createAttendanceSession, endAttendanceSession, getActiveSessionForSection, getSubjectsForSection, createSubjectInFirebase, addSubjectToSection } from "@/lib/firebaseService";
import { Session, Teacher, listSections, listTeacherSessions } from "@/lib/store";
import { subscribeToAttendance } from "@/lib/firebaseService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, ArrowLeft, Camera } from "lucide-react";
import AttendanceSession from "@/components/AttendanceSession"; // FaceAPI version
import { addAttendance } from "@/lib/store";

interface TeacherDashboardProps {
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout }) => {
  const { currentUser, logout, loading: authLoading } = useAuth();
  // Safe name display
  const teacherName = currentUser?.name || "Professor";
  const navigate = useNavigate();
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  const [mySections, setMySections] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);

  const [liveAttendance, setLiveAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  // Load history
  useEffect(() => {
    if (currentUser?.id) {
      listTeacherSessions(currentUser.id).then(setSessionHistory);
    }
  }, [currentUser, activeSession]);

  const [isKioskMode, setIsKioskMode] = useState(false);

  const handleStudentDetected = useCallback(async (studentData: any) => {
    if (!activeSession) return;

    // Check if already in liveAttendance to avoid spam
    if (liveAttendance.find(a => a.studentId === studentData.rollNumber)) return;

    console.log("🎯 KIOSK: Student detected:", studentData);

    // Optimistically update UI immediately
    const newRecord = {
      id: Date.now().toString(),
      studentId: studentData.rollNumber, // Display roll number in UI list
      studentName: studentData.name,
      confidence: studentData.confidence,
      timestamp: new Date().toISOString()
    };

    setLiveAttendance(prev => {
      // Double check inside setter to be safe against race conditions
      if (prev.find(a => a.studentId === studentData.rollNumber)) return prev;
      return [newRecord, ...prev];
    });

    try {
      // Corrected: Pass a single object matching `AttendanceRecord` requirements
      // CRITICAL: Use studentData.id (Firestore ID) here so StudentDashboard can find it
      await addAttendance({
        studentId: studentData.id,
        subjectId: activeSession.subjectId,
        teacherId: activeSession.teacherId,
        sectionId: activeSession.sectionId,
        timestamp: Date.now(),
        period: 1, // Default to period 1 for kiosk mode or derive if possible
        present: true,
        topic: "Kiosk Mode Entry"
      });
    } catch (e) {
      console.error("Error marking attendance:", e);
      // Optional: Revert optimistic update if needed, but for attendance usually fine to keep logic simple
    }
  }, [activeSession, liveAttendance]);

  // Load teacher's sections on mount - IMMEDIATELY
  useEffect(() => {
    const loadData = async () => {
      console.log("🔍 TeacherDashboard: Loading sections IMMEDIATELY...");

      try {
        const allSections = await listSections();
        console.log("📚 All sections from Firebase:", allSections);

        if (allSections.length > 0) {
          setMySections(allSections);
          setSelectedSection(allSections[0].id);
        } else {
          console.warn("⚠️ No sections in Firebase, using fallbacks");
          // FALLBACK: Use hardcoded sections for demo
          const fallbackSections = [
            { id: "CSE-A", name: "CSE-A" },
            { id: "CSE-B", name: "CSE-B" },
          ];
          setMySections(fallbackSections);
          setSelectedSection("CSE-A");
        }
      } catch (error) {
        console.error("❌ Error loading sections:", error);
        // FALLBACK on any error
        const fallbackSections = [
          { id: "CSE-A", name: "CSE-A" },
          { id: "CSE-B", name: "CSE-B" },
        ];
        setMySections(fallbackSections);
        setSelectedSection("CSE-A");
      }
    };

    // Load immediately - don't wait for anything
    loadData();
  }, []); // Empty dependency - run once on mount


  // Auto-select first subject when section changes
  useEffect(() => {
    if (selectedSection) {
      const loadSubs = async () => {
        console.log(`🔄 Loading subjects for section: ${selectedSection}`);
        try {
          const subs = await getSubjectsForSection(selectedSection);
          console.log(`📖 Subjects found:`, subs);

          if (subs.length > 0) {
            setAvailableSubjects(subs);
            setSelectedSubject(subs[0].id);
          } else {
            console.warn("⚠️ No subjects found, using fallback subjects");
            // Fallback subjects for demo
            const fallbackSubs = [
              { id: "java", name: "Java" },
              { id: "python", name: "Python" },
              { id: "dbms", name: "DBMS" },
            ];
            setAvailableSubjects(fallbackSubs);
            setSelectedSubject(fallbackSubs[0].id);
          }
        } catch (error) {
          console.error("❌ Error loading subjects:", error);
          // Fallback on error
          const fallbackSubs = [
            { id: "java", name: "Java" },
            { id: "python", name: "Python" },
          ];
          setAvailableSubjects(fallbackSubs);
          setSelectedSubject(fallbackSubs[0].id);
        }
      };
      loadSubs();

      const checkSession = async () => {
        const session = await getActiveSessionForSection(selectedSection);
        setActiveSession(session);
      };
      checkSession();
    }
  }, [selectedSection]);

  // Subscribe to live attendance when session is active
  useEffect(() => {
    if (activeSession) {
      // We need a way to subscribe to attendance logs for THIS session.
      // existing `subscribeToAttendance` is per student.
      // We need `subscribeToSessionAttendance`.
      // For now, let's just Poll or mock?
      // Let's create `subscribeToSectionAttendance` in firebaseService later.
      // For this Demo, we will just use a placeholder or previous logic.

      // TODO: Implement Real-time listener for current session logs
    }
  }, [activeSession]);

  const handleAddSubject = async () => {
    if (!newSubjectName || !selectedSection) return;
    setIsAddingSubject(true);
    try {
      const newSub = await createSubjectInFirebase(newSubjectName);
      await addSubjectToSection(selectedSection, newSub.id);

      // Refresh list
      const subs = await getSubjectsForSection(selectedSection);
      setAvailableSubjects(subs);
      setSelectedSubject(newSub.id); // Auto select new one
      setShowAddSubject(false);
      setNewSubjectName("");
    } catch (e: any) {
      alert("Failed to add subject: " + e.message);
    } finally {
      setIsAddingSubject(false);
    }
  };

  const handleStartSession = async (mode: "demo" | "live") => {
    if (!selectedSection || !selectedSubject) return;
    setLoading(true);
    try {
      const duration = mode === "demo" ? 10 : 60; // 10 mins for demo, 60 for live
      // Fallback ID if user isn't fully loaded yet (prevents crash)
      const teacherId = currentUser?.id || "demo-teacher-id";

      const session = await createAttendanceSession(
        teacherId,
        selectedSection,
        selectedSubject,
        mode,
        duration
      );
      setActiveSession(session);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    setLoading(true);
    try {
      await endAttendanceSession(activeSession.id);
      setActiveSession(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-purple-600 p-2 rounded-lg text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Classroom Control
            </h1>
            <p className="text-xs text-muted-foreground">Welcome, {currentUser?.name || "Professor"}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-red-500">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid gap-6 md:grid-cols-[350px_1fr]">

        {/* Left Panel: Controls */}
        <div className="space-y-6">
          {/* Class Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle>Session Setup</CardTitle>
              <CardDescription>Select class context</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Class Section</label>
                <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!!activeSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {mySections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!!activeSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>

                {!activeSession && selectedSection && (
                  <Dialog open={showAddSubject} onOpenChange={setShowAddSubject}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="px-0 text-xs h-auto text-blue-600">
                        <PlusCircle className="w-3 h-3 mr-1" /> Add New Subject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Subject</DialogTitle>
                        <DialogDescription>Create a subject for this section immediately.</DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="space-y-2">
                          <Label>Subject Name</Label>
                          <Input
                            placeholder="e.g. Applied Physics"
                            value={newSubjectName}
                            onChange={e => setNewSubjectName(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddSubject(false)}>Cancel</Button>
                        <Button onClick={handleAddSubject} disabled={!newSubjectName || isAddingSubject}>
                          {isAddingSubject ? "Adding..." : "Add Subject"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Card */}
          {!activeSession ? (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle>Start Attendance</CardTitle>
                <CardDescription>Choose a mode to begin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  onClick={() => handleStartSession("demo")}
                  disabled={!selectedSection || !selectedSubject || loading}
                >
                  <Zap className="h-4 w-4 mr-2 text-yellow-300" />
                  Start Demo Session
                </Button>
                <p className="text-xs text-center text-muted-foreground">Lasts 10 mins. No timetable needed.</p>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">Or</span></div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleStartSession("live")}
                  disabled={!selectedSection || !selectedSubject || loading}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Start Live Class
                </Button>
                <p className="text-xs text-center text-muted-foreground">Follows official university timetable.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-l-4 border-l-green-500 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center justify-between">
                  Active Session
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center bg-white p-3 rounded-md border shadow-sm">
                  <span className="text-sm font-medium text-gray-500">Session Code</span>
                  <span className="text-2xl font-mono font-bold tracking-widest">{activeSession.code}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Mode</span>
                    <Badge variant={activeSession.mode === "demo" ? "secondary" : "default"}>{activeSession.mode.toUpperCase()}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expires</span>
                    <span>{new Date(activeSession.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="w-full mt-4"
                  onClick={handleEndSession}
                  disabled={loading}
                >
                  <Square className="h-4 w-4 mr-2 fill-current" />
                  End Session
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel: Live Stats */}
        <div className="space-y-6">
          <Tabs defaultValue="monitor" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="monitor" className="space-y-4">
              {activeSession ? (
                isKioskMode ? (
                  <div className="space-y-4">
                    <Button variant="outline" onClick={() => setIsKioskMode(false)} className="mb-4">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                    <AttendanceSession
                      sectionId={selectedSection}
                      detectedStudents={liveAttendance.map(a => ({ name: a.studentName || a.studentId, rollNumber: a.studentId }))}
                      onStudentDetected={handleStudentDetected}
                    />
                  </div>
                ) : (
                  <Card className="h-[500px] flex flex-col">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-center">
                        <span>Live Attendance Log</span>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setIsKioskMode(true)} className="bg-purple-600 hover:bg-purple-700">
                            <Camera className="mr-2 h-4 w-4" /> Kiosk Scanner
                          </Button>
                          <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 border-green-200">
                            {liveAttendance.length} Present
                          </Badge>
                        </div>
                      </CardTitle>
                      <CardDescription>Real-time updates as students mark attendance.</CardDescription>
                    </CardHeader>
                    <Separator />
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-3">
                        {liveAttendance.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                            <QrCode className="h-10 w-10 mb-3 opacity-20" />
                            <p>Waiting for students...</p>
                          </div>
                        ) : (
                          liveAttendance.map((record) => (
                            <div key={record.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm animate-in fade-in slide-in-from-bottom-2">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                  {record.studentName ? record.studentName.charAt(0) : "S"}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{record.studentName || record.studentId}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(record.timestamp).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-700 border-green-200">Present</Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </Card>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] border border-dashed rounded-lg">
                  <Play className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-muted-foreground text-sm">Start a session to monitor attendance</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Class History</CardTitle>
                  <CardDescription>View past sessions and reports.</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px] overflow-auto">
                  {sessionHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <History className="h-10 w-10 mb-2 opacity-20" />
                      <p>No past sessions found.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessionHistory.map(session => (
                        <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                          <div>
                            <div className="font-semibold">{session.subjectId} ({session.sectionId})</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(session.startTime).toLocaleDateString()} • {new Date(session.startTime).toLocaleTimeString()}
                            </div>
                          </div>
                          <Badge variant={session.isActive ? "default" : "secondary"}>
                            {session.isActive ? "Active" : "Completed"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs >
        </div >

      </main >
    </div >
  );
};

export default TeacherDashboard;