import { CheckCircle, UserCheck, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Student {
  rollNumber: string;
  name: string;
  timestamp?: string;
  message?: string;
}

export const showAttendanceNotification = (student: Student) => {
  const timestamp = student.timestamp || new Date().toLocaleTimeString();
  const isSystem = student.name === "System";

  toast({
    duration: 4000,
    className: "bg-card border-accent",
    description: (
      <motion.div
        className="flex items-center space-x-3 p-2"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex-shrink-0">
          {isSystem ? (
            <Clock className="h-6 w-6 text-blue-400 animate-pulse" />
          ) : (
            <CheckCircle className="h-6 w-6 text-accent animate-pulse" />
          )}
        </div>
        <div className="flex-grow">
          <div className="flex items-center space-x-2 mb-1">
            {!isSystem && <UserCheck className="h-4 w-4 text-primary" />}
            <span className="font-semibold text-primary">{student.name}</span>
            {student.rollNumber !== "INFO" && (
              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                {student.rollNumber}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {!isSystem && <Clock className="h-3 w-3" />}
            <span>{student.message || `Marked present at ${timestamp}`}</span>
          </div>
        </div>
        {!isSystem && (
          <div className="flex-shrink-0">
            <motion.div
              className="w-2 h-2 bg-accent rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.7, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        )}
      </motion.div>
    ),
  });
};

export const showSessionStartNotification = () => {
  toast({
    duration: 3000,
    className: "bg-card border-primary",
    description: (
      <motion.div
        className="flex items-center space-x-3 p-2"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
        <span className="font-medium text-primary">Attendance session started</span>
      </motion.div>
    ),
  });
};

export const showSessionEndNotification = (count: number) => {
  toast({
    duration: 5000,
    className: "bg-card border-accent",
    description: (
      <motion.div
        className="flex items-center space-x-3 p-2"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <CheckCircle className="h-5 w-5 text-accent" />
        <div>
          <div className="font-medium text-foreground">Session completed!</div>
          <div className="text-sm text-muted-foreground">{count} students marked present</div>
        </div>
      </motion.div>
    ),
  });
};