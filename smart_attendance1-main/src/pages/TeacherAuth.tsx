import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { assignTeacherToSection, createTeacher, ensureDemoSeed, listSections, setSession } from "@/lib/store";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, Shield, CheckCircle } from "lucide-react";

const TeacherAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(() => {
    const urlMode = searchParams.get("mode");
    return urlMode === "login" ? "login" : "signup";
  });
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [sectionId, setSectionId] = useState<string>("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("🔍 TeacherAuth: Loading sections...");
        await ensureDemoSeed();
        const sectionsList = await listSections();
        console.log("📚 Sections from Firebase:", sectionsList);

        let uniqueSections = [];
        if (sectionsList.length > 0) {
          // Ensure uniqueness by Name
          uniqueSections = Array.from(new Map(sectionsList.map(s => [s.name, s])).values());
        } else {
          console.warn("⚠️ No sections found in Firebase! Using fallbacks.");
          // Fallback sections
          uniqueSections = [
            { id: "CSE-A", name: "CSE-A" },
            { id: "CSE-B", name: "CSE-B" },
          ];
        }

        setSections(uniqueSections);
      } catch (error) {
        console.error("Error loading data:", error);
        // Fallback on error
        setSections([
          { id: "CSE-A", name: "CSE-A" },
          { id: "CSE-B", name: "CSE-B" },
        ]);
      }
    };
    loadData();
  }, []);

  // Reset step when mode changes
  useEffect(() => {
    setStep(1);
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        try {
          // Login with Firebase Auth
          // Note: We are using Email for Firebase Auth, but UI might ask for Employee ID. 
          // For now, let's assume Employee ID is NOT the email. 
          // Wait, the UI asks for Employee ID. 
          // If we want Firebase Auth, we need Email.
          // Let's modify the UI to ask for Email for login, OR lookup email by Employee ID.
          // For simplicity in this refactor, let's look up the teacher by Employee ID first to get their email?
          // That's insecure if anyone can get email by ID.
          // Better: Change Login UI to ask for Email.

          await signInWithEmailAndPassword(auth, email || employeeId, password); // Optimistically try employeeId as email if typed there
          // The AuthContext will pick this up.
          navigate("/teacher");
        } catch (err: any) {
          console.error("Login error:", err);
          alert("Login failed: " + err.message);
          setLoading(false);
        }
        return;
      }

      if (step === 1) {
        const phoneOk = /^\d{10}$/.test(phone);
        if (!name || !email || !employeeId || !department || !password || !phoneOk) {
          alert("Please fill all fields");
          setLoading(false);
          return;
        }
        setStep(2);
        setLoading(false);
        return;
      }

      try {
        // 1. Create Firebase Auth User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // 2. Create Firestore Profile
        const created = await createTeacher({
          name,
          email,
          employeeId,
          sectionIds: sectionId ? [sectionId] : [],
          department,
          phone,
          password: "", // Don't store plain password in Firestore anymore!
          uid
        });

        if (sectionId) {
          await assignTeacherToSection(created.id, sectionId);
        }

        navigate("/teacher");
      } catch (err: any) {
        alert(err?.message || "Signup failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-full bg-purple-500/20 text-purple-400 mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Teacher {mode === "signup" ? "Access" : "Login"}</h1>
            <p className="text-zinc-400 text-sm">Manage your classroom with AI power</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Full Name</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-black/40 border-white/10 text-white"
                        placeholder="e.g. Alan Turing"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Department</Label>
                      <Input
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="bg-black/40 border-white/10 text-white"
                        placeholder="e.g. Computer Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Employee ID</Label>
                      <Input
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="bg-black/40 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Email</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black/40 border-white/10 text-white"
                        placeholder="e.g. teacher@college.edu"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Phone</Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-black/40 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Password</Label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-black/40 border-white/10 text-white"
                      />
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Assign Section (Optional)</Label>
                      <Select value={sectionId} onValueChange={setSectionId}>
                        <SelectTrigger className="bg-black/40 border-white/10 text-white">
                          <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                          {sections.map(s => (
                            <SelectItem key={s.id} value={s.id} className="focus:bg-zinc-800">{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
                      <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                      Almost done! This will create your teacher profile.
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {mode === "login" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-zinc-300">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black/40 border-white/10 text-white"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/40 border-white/10 text-white"
                  />
                </div>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-white text-black hover:bg-zinc-200 mt-6"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                mode === "signup" ? (step === 1 ? "Next Step" : "Complete Registration") : "Login to Dashboard"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="text-sm text-zinc-400 hover:text-white underline transition-colors"
            >
              {mode === "signup" ? "Already have an account? Login" : "New teacher? Create account"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherAuth;
