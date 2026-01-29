
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { createTeacher, deleteTeacher, listAllTeachers, listSections, assignTeacherToSection } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const ManageTeachers = () => {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [department, setDepartment] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [password, setPassword] = useState("");

    const loadData = async () => {
        try {
            const t = await listAllTeachers();
            const s = await listSections();
            setTeachers(t);
            setSections(s);
        } catch (error) {
            console.error("Failed to load data", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddTeacher = async () => {
        if (!name || !email || !employeeId || !password) {
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
            const created = await createTeacher({
                name,
                email,
                employeeId,
                department,
                sectionIds: sectionId ? [sectionId] : [],
                uid
            });

            if (sectionId) {
                await assignTeacherToSection(created.id, sectionId);
            }

            toast({ title: "Teacher created", description: `${name} has been added.` });

            // Reset form
            setName("");
            setEmail("");
            setEmployeeId("");
            setDepartment("");
            setSectionId("");
            setPassword("");

            loadData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeacher = async (id: string) => {
        if (!confirm("Are you sure? This will delete the teacher profile. (Note: Auth account remains for now)")) return;
        try {
            await deleteTeacher(id);
            loadData();
            toast({ title: "Teacher deleted" });
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Teacher Directory</CardTitle>
                    <CardDescription>Manage faculty members and their assignments.</CardDescription>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Teacher</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Add New Teacher</DialogTitle>
                            <DialogDescription>Create a teacher account with access credentials.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                                <Input placeholder="Employee ID" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                <Input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Select value={sectionId} onValueChange={setSectionId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Assign Section (Optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddTeacher} disabled={loading}>{loading ? "Creating..." : "Create Teacher"}</Button>
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
                            <TableHead>Department</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teachers.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No teachers found</TableCell></TableRow>}
                        {teachers.map((teacher) => (
                            <TableRow key={teacher.id}>
                                <TableCell className="font-medium">
                                    <div>{teacher.name}</div>
                                    <div className="text-xs text-muted-foreground">{teacher.employeeId}</div>
                                </TableCell>
                                <TableCell>{teacher.email}</TableCell>
                                <TableCell>{teacher.department || "N/A"}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTeacher(teacher.id)}>
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
