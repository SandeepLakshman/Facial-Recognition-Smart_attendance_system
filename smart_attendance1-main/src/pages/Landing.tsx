import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, ArrowRight, Shield, Zap, BarChart, CheckCircle2, GraduationCap } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              SmartAttend
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                const element = document.getElementById("login-section");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="bg-white text-black hover:bg-zinc-200"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Face Recognition Active
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight"
          >
            Attendance tracking, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              reimagined for speed.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto"
          >
            Forget roll calls. SmartAttend uses advanced AI to mark attendance in milliseconds, secure your classroom, and generate instant reports.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 scroll-mt-20"
            id="login-section"
          >
            <Link to="/teacher/auth?mode=login">
              <Button
                size="lg"
                className="h-14 px-8 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-0 rounded-full shadow-lg shadow-purple-500/20"
              >
                <Shield className="mr-2 h-5 w-5" />
                Teacher Login
              </Button>
            </Link>

            <Link to="/student/auth?mode=login">
              <Button
                size="lg"
                className="h-14 px-8 text-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full backdrop-blur-sm"
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                Student Login
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-32 px-6 border-t border-white/5 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-yellow-400" />}
              title="Lightning Fast"
              description="Mark attendance for an entire class in under 5 seconds with multi-face detection."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-green-400" />}
              title="Bank-grade Security"
              description="End-to-end encryption ensures student biometrics are safe and private."
            />
            <FeatureCard
              icon={<BarChart className="h-6 w-6 text-blue-400" />}
              title="Smart Analytics"
              description="Spot trends, track absentees, and export reports with one click."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

export default Landing;