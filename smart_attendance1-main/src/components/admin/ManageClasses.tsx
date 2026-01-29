
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, BookOpen, Layers } from "lucide-react";
import { createSection, createSubject, deleteSection, deleteSubject, listSections, listSubjects } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

export const ManageClasses = () => {
    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [newSectionName, setNewSectionName] = useState("");
    const [newSubjectName, setNewSubjectName] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const loadData = async () => {
        try {
            const s = await listSections();
            const sub = await listSubjects();
            setSections(s);
            setSubjects(sub);
        } catch (error) {
            console.error("Failed to load data", error);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAddSection = async () => {
        if (!newSectionName.trim()) return;
        setLoading(true);
        try {
            await createSection(newSectionName);
            setNewSectionName("");
            toast({ title: "Section created", description: `${newSectionName} added successfully` });
            loadData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubject = async () => {
        if (!newSubjectName.trim()) return;
        setLoading(true);
        try {
            await createSubject(newSubjectName);
            setNewSubjectName("");
            toast({ title: "Subject created", description: `${newSubjectName} added successfully` });
            loadData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSection = async (id: string) => {
        if (!confirm("Are you sure? This will remove the section from all teachers.")) return;
        try {
            await deleteSection(id);
            loadData();
            toast({ title: "Section deleted" });
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    const handleDeleteSubject = async (id: string) => {
        if (!confirm("Are you sure? This will remove the subject from all sections.")) return;
        try {
            await deleteSubject(id);
            loadData();
            toast({ title: "Subject deleted" });
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* SECTIONS CARD */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" /> Classes / Sections</CardTitle>
                        <CardDescription>Manage student groups (e.g., CSE-A)</CardDescription>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Class</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Class Section</DialogTitle>
                                <DialogDescription>Create a new section for students.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Input
                                    placeholder="Section Name (e.g. CSE-A)"
                                    value={newSectionName}
                                    onChange={(e) => setNewSectionName(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddSection} disabled={loading}>Create Section</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sections.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No sections found</TableCell></TableRow>}
                            {sections.map((section) => (
                                <TableRow key={section.id}>
                                    <TableCell className="font-medium">{section.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteSection(section.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* SUBJECTS CARD */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Subjects</CardTitle>
                        <CardDescription>Manage curriculum subjects</CardDescription>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Subject</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Subject</DialogTitle>
                                <DialogDescription>Create a new subject for the curriculum.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Input
                                    placeholder="Subject Name (e.g. Data Structures)"
                                    value={newSubjectName}
                                    onChange={(e) => setNewSubjectName(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddSubject} disabled={loading}>Create Subject</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subjects.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No subjects found</TableCell></TableRow>}
                            {subjects.map((subject) => (
                                <TableRow key={subject.id}>
                                    <TableCell className="font-medium">{subject.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteSubject(subject.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
