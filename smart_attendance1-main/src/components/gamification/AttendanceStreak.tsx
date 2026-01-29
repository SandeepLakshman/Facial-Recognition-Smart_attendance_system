import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface AttendanceStreakProps {
  currentStreak: number;
  bestStreak: number;
  attendancePercentage: number;
}

export function AttendanceStreak({ 
  currentStreak, 
  bestStreak, 
  attendancePercentage 
}: AttendanceStreakProps) {
  const getStreakIcon = () => {
    if (currentStreak >= 10) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (currentStreak >= 5) return <Flame className="h-6 w-6 text-orange-500" />;
    return <Target className="h-6 w-6 text-blue-500" />;
  };

  const getStreakMessage = () => {
    if (currentStreak >= 10) return "🏆 Attendance Champion!";
    if (currentStreak >= 5) return "🔥 On Fire!";
    if (currentStreak >= 3) return "⚡ Great Streak!";
    return "🎯 Keep Going!";
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-card shadow-card hover-scale">
        <CardContent className="p-6">
          <motion.div 
            className="text-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center mb-3">
              {getStreakIcon()}
            </div>
            <div className="text-3xl font-bold text-primary mb-1">
              {currentStreak}
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              Current Streak
            </div>
            <Badge className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {getStreakMessage()}
            </Badge>
          </motion.div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent mb-1">
              {bestStreak}
            </div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {attendancePercentage}%
            </div>
            <div className="text-xs text-muted-foreground">Overall</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress towards next milestone */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Next Milestone</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div 
              className="bg-gradient-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStreak % 5) * 20}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {5 - (currentStreak % 5)} days to next level
          </div>
        </CardContent>
      </Card>
    </div>
  );
}