import { useState } from "react";
import { motion } from "framer-motion";
import RoleSelection from "@/components/RoleSelection";
import StudentDashboard from "@/components/StudentDashboard";
import TeacherDashboard from "@/components/TeacherDashboard";
import { ParallaxBackground } from "@/components/backgrounds/ParallaxBackground";
import { MouseReactiveBackground } from "@/components/backgrounds/MouseReactiveBackground";

type Role = "student" | "teacher" | null;

const Index = () => {
  const [selectedRole, setSelectedRole] = useState<Role>(null);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleLogout = () => {
    setSelectedRole(null);
  };

  return (
    <MouseReactiveBackground>
      <ParallaxBackground>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen"
        >
          {!selectedRole && (
            <RoleSelection onRoleSelect={handleRoleSelect} />
          )}
          {selectedRole === "student" && (
            <StudentDashboard onLogout={handleLogout} />
          )}
          {selectedRole === "teacher" && (
            <TeacherDashboard onLogout={handleLogout} />
          )}
        </motion.div>
      </ParallaxBackground>
    </MouseReactiveBackground>
  );
};

export default Index;