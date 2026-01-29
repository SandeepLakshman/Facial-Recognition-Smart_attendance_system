import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, Camera, BarChart3 } from "lucide-react";

interface RoleSelectionProps {
  onRoleSelect: (role: "student" | "teacher") => void;
}

const RoleSelection = ({ onRoleSelect }: RoleSelectionProps) => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Camera className="h-12 w-12 text-white mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              SmartAttend
            </h1>
          </div>
          <p className="text-xl text-white/90 mb-2">
            AI-Powered Facial Recognition Attendance System
          </p>
          <p className="text-white/70">
            Automated attendance tracking with computer vision technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Card className="shadow-elevation hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-accent/10 rounded-full w-fit">
                <GraduationCap className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">Student Portal</CardTitle>
              <CardDescription className="text-lg">
                Register and view your attendance history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3" />
                  Self-registration with facial recognition
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3" />
                  View personal attendance records
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-accent rounded-full mr-3" />
                  Real-time attendance tracking
                </li>
              </ul>
              <Button 
                onClick={() => onRoleSelect("student")}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                size="lg"
              >
                Enter as Student
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-elevation hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Teacher Portal</CardTitle>
              <CardDescription className="text-lg">
                Manage attendance and monitor students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  Start live attendance sessions
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  Download attendance reports
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                  Analytics and insights
                </li>
              </ul>
              <Button 
                onClick={() => onRoleSelect("teacher")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="lg"
              >
                Enter as Teacher
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <div className="flex items-center justify-center space-x-8 text-white/60">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              <span>Real-time Analytics</span>
            </div>
            <div className="flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              <span>AI Recognition</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;