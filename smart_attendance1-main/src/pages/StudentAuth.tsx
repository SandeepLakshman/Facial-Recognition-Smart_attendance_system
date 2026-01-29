import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createStudent, ensureDemoSeed, listSections } from "@/lib/store";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming this exists or used
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, GraduationCap } from "lucide-react";
import FaceCapture from "@/components/FaceCapture"; // Use FaceAPI version

const StudentAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(() => {
    const urlMode = searchParams.get("mode");
    return urlMode === "login" ? "login" : "signup";
  });
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [sectionId, setSectionId] = useState<string>("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [consentFaceData, setConsentFaceData] = useState(false);
  const [consentParentNotify, setConsentParentNotify] = useState(false);
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");

  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [registeredStudent, setRegisteredStudent] = useState<any>(null);

  // Reset step when mode changes
  useEffect(() => {
    setStep(1);
  }, [mode]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await ensureDemoSeed();
        const sectionsList = await listSections();
        const uniqueSections = Array.from(new Map(sectionsList.map(s => [s.name, s])).values());
        setSections(uniqueSections);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        // ... existing login logic ...
        try {
          await signInWithEmailAndPassword(auth, email, password);
          navigate("/student");
        } catch (err: any) {
          console.error("Login error:", err);
          alert("Login failed: " + err.message);
          setLoading(false);
        }
        return;
      }

      if (step === 1) {
        // ... existing step 1 logic ...
        const phoneOk = /^\d{10}$/.test(guardianPhone) || true; // Bypass phone validation for demo if needed, or keep strictly
        if (!name || !email || !rollNumber || !sectionId || !department || !password) {
          alert("Please fill all fields");
          setLoading(false);
          return;
        }
        setStep(2);
        setLoading(false);
        return;
      }

      if (step === 2) {
        // ... existing step 2 logic ...
        const phoneOk = /^\d{10}$/.test(guardianPhone);
        if (!phoneOk || !consentFaceData || !consentParentNotify) {
          alert("Please provide guardian phone and give consents to proceed.");
          setLoading(false);
          return;
        }

        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;

          const created = await createStudent({
            name,
            email,
            rollNumber,
            sectionId,
            guardianPhone,
            alternatePhone,
            consentFaceData,
            consentParentNotify,
            department,
            password: "",
            uid
          });

          // Instead of navigating, show Face Capture
          setRegisteredStudent(created);
          setShowFaceCapture(true);
          setLoading(false);

        } catch (err: any) {
          alert(err?.message || "Signup failed");
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (showFaceCapture && registeredStudent) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <FaceCapture
          studentData={registeredStudent}
          onComplete={() => {
            alert("✅ Registration Complete! Redirecting to dashboard...");
            navigate("/student");
          }}
          onBack={() => {
            // If they skip, warn them? Or just go to dashboard
            if (confirm("Skip face registration? You won't be able to mark attendance.")) {
              navigate("/student");
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* ... existing clean UI ... */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
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
            <div className="inline-flex p-3 rounded-full bg-blue-500/20 text-blue-400 mb-4">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Student {mode === "signup" ? "Access" : "Login"}</h1>
            <p className="text-zinc-400 text-sm">Check your attendance and stats</p>
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
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Email</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black/40 border-white/10 text-white"
                        placeholder="e.g. rahul@student.edu"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Roll Number</Label>
                        <Input
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          className="bg-black/40 border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Department</Label>
                        <Input
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="bg-black/40 border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-300">Section</Label>
                      <Select value={sectionId} onValueChange={setSectionId}>
                        <SelectTrigger className="bg-black/40 border-white/10 text-white">
                          <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                          {sections.map(s => (
                            <SelectItem key={s.id} value={s.id} className="focus:bg-zinc-800">{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Label className="text-zinc-300">Parent/Guardian Phone</Label>
                      <Input
                        value={guardianPhone}
                        onChange={(e) => setGuardianPhone(e.target.value)}
                        className="bg-black/40 border-white/10 text-white"
                        placeholder="10 digit mobile number"
                      />
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <Checkbox
                          id="consentFace"
                          checked={consentFaceData}
                          onCheckedChange={(v) => setConsentFaceData(Boolean(v))}
                          className="mt-1 border-white/50 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                        <Label htmlFor="consentFace" className="text-sm text-zinc-300 leading-tight cursor-pointer">
                          I consent to face data collection for automated attendance tracking.
                        </Label>
                      </div>

                      <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <Checkbox
                          id="consentNotif"
                          checked={consentParentNotify}
                          onCheckedChange={(v) => setConsentParentNotify(Boolean(v))}
                          className="mt-1 border-white/50 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                        />
                        <Label htmlFor="consentNotif" className="text-sm text-zinc-300 leading-tight cursor-pointer">
                          I consent to SMS notifications being sent to my guardian.
                        </Label>
                      </div>
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
                mode === "signup" ? (step === 1 ? "Next Step" : "Complete Registration & Scan Face") : "Login to Portal"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="text-sm text-zinc-400 hover:text-white underline transition-colors"
            >
              {mode === "signup" ? "Already have an account? Login" : "New student? Create account"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; // End StudentAuth

export default StudentAuth;
