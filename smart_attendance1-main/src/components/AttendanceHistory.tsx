import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { getAttendanceForStudent, getSubjectsForSection } from "@/lib/store";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AttendanceHistoryProps {
  studentRoll: string;
  studentId?: string;
  sectionId?: string;
}

const formatTime = (ms: number) => new Date(ms).toLocaleTimeString();
const formatDate = (ms: number) => new Date(ms).toLocaleDateString();

const COLORS = ['#10b981', '#ef4444', '#3b82f6'];

const AttendanceHistory = ({ studentRoll, studentId, sectionId }: AttendanceHistoryProps) => {
  const [records, setRecords] = useState<Array<{ date: string; time: string; status: string; subject: string; timestamp: number; subjectId: string }>>([]);
  const [subjects, setSubjects] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Get student ID if not provided
        let sid = studentId;
        if (!sid) {
          const { findStudentByRollNumber } = await import("@/lib/firebaseService");
          const student = await findStudentByRollNumber(studentRoll);
          if (student) {
            sid = student.id;
            if (sectionId === undefined) {
              // Load subjects for student's section
              if (student.sectionId) {
                const subs = await getSubjectsForSection(student.sectionId);
                const subjectMap: Record<string, string> = {};
                subs.forEach(sub => {
                  subjectMap[sub.id] = sub.name;
                });
                setSubjects(subjectMap);
              }
            }
          }
        }
        
        if (sid) {
          // Load subjects first
          let subjectMap: Record<string, string> = {};
          if (sectionId) {
            const subs = await getSubjectsForSection(sectionId);
            subs.forEach(sub => {
              subjectMap[sub.id] = sub.name;
            });
          } else {
            // Try to get section from student
            const { getStudentFromFirebase } = await import("@/lib/firebaseService");
            const student = await getStudentFromFirebase(sid);
            if (student?.sectionId) {
              const subs = await getSubjectsForSection(student.sectionId);
              subs.forEach(sub => {
                subjectMap[sub.id] = sub.name;
              });
            }
          }
          setSubjects(subjectMap);
          
          // Load attendance records
          const attendanceRecords = await getAttendanceForStudent(sid);
          
          // Map attendance records
          const mappedRecords = attendanceRecords
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(a => ({
              date: formatDate(a.timestamp),
              time: a.present ? formatTime(a.timestamp) : "—",
              status: a.present ? "Present" : "Absent",
              subject: subjectMap[a.subjectId] || "Subject",
              timestamp: a.timestamp,
              subjectId: a.subjectId
            }));
          
          setRecords(mappedRecords);
        }
      } catch (error) {
        console.error("Error loading attendance data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [studentRoll, studentId, sectionId]);

  const presentCount = records.filter(record => record.status === "Present").length;
  const absentCount = records.filter(record => record.status === "Absent").length;
  const totalClasses = records.length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  // Chart data
  const pieData = [
    { name: 'Present', value: presentCount, color: '#10b981' },
    { name: 'Absent', value: absentCount, color: '#ef4444' }
  ];

  // Attendance by subject
  const subjectData = useMemo(() => {
    const subjectStats: Record<string, { present: number; absent: number; total: number }> = {};
    
    records.forEach(record => {
      if (!subjectStats[record.subjectId]) {
        subjectStats[record.subjectId] = { present: 0, absent: 0, total: 0 };
      }
      subjectStats[record.subjectId].total++;
      if (record.status === "Present") {
        subjectStats[record.subjectId].present++;
      } else {
        subjectStats[record.subjectId].absent++;
      }
    });
    
    return Object.entries(subjectStats).map(([subjectId, stats]) => ({
      subject: subjects[subjectId] || "Unknown",
      present: stats.present,
      absent: stats.absent,
      percentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
    }));
  }, [records, subjects]);

  // Attendance over time (last 30 days)
  const timeSeriesData = useMemo(() => {
    const last30Days: Record<string, { present: number; total: number }> = {};
    const today = new Date();
    
    // Initialize last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date.getTime());
      last30Days[dateStr] = { present: 0, total: 0 };
    }
    
    // Count attendance by date
    records.forEach(record => {
      if (last30Days[record.date]) {
        last30Days[record.date].total++;
        if (record.status === "Present") {
          last30Days[record.date].present++;
        }
      }
    });
    
    return Object.entries(last30Days)
      .reverse()
      .map(([date, stats]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        present: stats.present,
        total: stats.total,
        percentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0
      }));
  }, [records]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Attendance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/10 rounded-full">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold">{presentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold">{absentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Attendance</p>
                <p className="text-2xl font-bold">{attendancePercentage}%</p>
                <p className="text-xs text-muted-foreground mt-1">{totalClasses} total classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Attendance Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Attendance Distribution</span>
            </CardTitle>
            <CardDescription>Overall attendance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {totalClasses > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No attendance data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Attendance by Subject */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Attendance by Subject</span>
            </CardTitle>
            <CardDescription>Performance across different subjects</CardDescription>
          </CardHeader>
          <CardContent>
            {subjectData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#10b981" name="Present" />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No subject data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line Chart - Attendance Over Time */}
      {timeSeriesData.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Attendance Trend (Last 30 Days)</span>
            </CardTitle>
            <CardDescription>Daily attendance percentage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="percentage" stroke="#3b82f6" name="Attendance %" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Attendance Records */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Attendance History</span>
          </CardTitle>
          <CardDescription>
            Your complete attendance record for recent classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.map((record, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{record.date}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {record.subject}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {record.status === "Present" && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{record.time}</span>
                    </div>
                  )}
                  <Badge 
                    variant={record.status === "Present" ? "default" : "destructive"}
                    className={record.status === "Present" 
                      ? "bg-accent hover:bg-accent/90 text-accent-foreground" 
                      : ""
                    }
                  >
                    {record.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceHistory;