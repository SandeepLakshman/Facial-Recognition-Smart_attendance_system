import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, TrendingUp, Users, FileText } from "lucide-react";

// Mock data for reports
const mockReportData = [
  { date: "2024-01-15", subject: "Computer Science", present: 28, total: 35, percentage: 80 },
  { date: "2024-01-14", subject: "Mathematics", present: 32, total: 35, percentage: 91 },
  { date: "2024-01-13", subject: "Physics", present: 25, total: 35, percentage: 71 },
  { date: "2024-01-12", subject: "Computer Science", present: 30, total: 35, percentage: 86 },
  { date: "2024-01-11", subject: "English", present: 33, total: 35, percentage: 94 },
];

const topPerformers = [
  { rollNumber: "CS001", name: "Alice Johnson", attendance: 98 },
  { rollNumber: "CS002", name: "Bob Smith", attendance: 95 },
  { rollNumber: "CS003", name: "Carol Williams", attendance: 92 },
  { rollNumber: "CS005", name: "Eva Davis", attendance: 90 },
  { rollNumber: "CS004", name: "David Brown", attendance: 87 },
];

const AttendanceReports = () => {
  const overallAttendance = Math.round(
    mockReportData.reduce((sum, record) => sum + record.percentage, 0) / mockReportData.length
  );

  const totalStudentsPresent = mockReportData.reduce((sum, record) => sum + record.present, 0);
  const totalPossibleAttendance = mockReportData.reduce((sum, record) => sum + record.total, 0);

  const handleExportReport = (type: string) => {
    alert(`Downloading ${type} report...`);
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overall Rate</p>
                <p className="text-2xl font-bold">{overallAttendance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/10 rounded-full">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Present</p>
                <p className="text-2xl font-bold">{totalStudentsPresent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-muted rounded-full">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="text-2xl font-bold">{mockReportData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <FileText className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reports</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Sessions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Sessions</span>
            </CardTitle>
            <CardDescription>
              Latest attendance sessions and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockReportData.map((record, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                >
                  <div>
                    <div className="font-medium">{record.subject}</div>
                    <div className="text-sm text-muted-foreground">{record.date}</div>
                    <div className="text-sm text-muted-foreground">
                      {record.present} / {record.total} students
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge 
                      variant={record.percentage >= 80 ? "default" : "destructive"}
                      className={record.percentage >= 80 
                        ? "bg-accent hover:bg-accent/90 text-accent-foreground" 
                        : ""
                      }
                    >
                      {record.percentage}%
                    </Badge>
                    <div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleExportReport(`session-${record.date}`)}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Top Performers</span>
            </CardTitle>
            <CardDescription>
              Students with highest attendance rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((student, index) => (
                <div 
                  key={student.rollNumber}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-sm font-medium text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.rollNumber}</div>
                    </div>
                  </div>
                  <Badge className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    {student.attendance}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export Reports</span>
          </CardTitle>
          <CardDescription>
            Download attendance reports in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => handleExportReport('complete-excel')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Download className="h-4 w-4 mr-2" />
              Complete Excel Report
            </Button>
            <Button 
              onClick={() => handleExportReport('summary-pdf')}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Summary PDF
            </Button>
            <Button 
              onClick={() => handleExportReport('student-wise')}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Student-wise Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceReports;