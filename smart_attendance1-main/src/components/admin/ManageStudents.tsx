
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, BadgeCheck } from "lucide-react";
import { createStudent, deleteStudent, listAllStudents, listSections } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const ManageStudents = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [rollNumber, setRollNumber] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [password, setPassword] = useState("");

    const loadData = async () => {
        try {
            const st = await listAllStudents();
            const s = await listSections();
            setStudents(st);
            setSections(s);
        } catch (error) {
            console.error("Failed to load data", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddStudent = async () => {
        if (!name || !email || !rollNumber || !sectionId || !password) {
            toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            // 1. Create Auth User
            let uid = undefined;
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                uid = userCredential.user.uid;
            } catch (authError: any) {
                toast({ title: "Auth Error", description: authError.message, variant: "destructive" });
                setLoading(false);
                return;
            }

            // 2. Create Firestore Record
            await createStudent({
                name,
                email,
                rollNumber,
                sectionId,
                uid,
                department: "General" // Default for quick add
            });

            toast({ title: "Student created", description: `${name} has been added.` });

            // Reset form
            setName("");
            setEmail("");
            setRollNumber("");
            setSectionId("");
            setPassword("");

            loadData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async (id: string) => {
        if (!confirm("Are you sure? This will delete the student profile. (Note: Auth account remains for now)")) return;
        try {
            await deleteStudent(id);
            loadData();
            toast({ title: "Student deleted" });
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Student Directory</CardTitle>
                    <CardDescription>Manage student records and class assignments.</CardDescription>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Student</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Add New Student</DialogTitle>
                            <DialogDescription>Create a student record with access credentials.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                                <Input placeholder="Roll Number" value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Select value={sectionId} onValueChange={setSectionId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Assign Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddStudent} disabled={loading}>{loading ? "Creating..." : "Create Student"}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No students found</TableCell></TableRow>}
                        {students.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center">
                                        {student.faceRegistered && <BadgeCheck className="h-4 w-4 text-green-500 mr-2" />}
                                        <div>
                                            <div>{student.name}</div>
                                            <div className="text-xs text-muted-foreground">{student.rollNumber}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{student.email}</TableCell>
                                {/* We need to map sectionId to Name, but for now just showing ID or simple logic */}
                                <TableCell>{sections.find(s => s.id === student.sectionId)?.name || "Unknown"}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(student.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
