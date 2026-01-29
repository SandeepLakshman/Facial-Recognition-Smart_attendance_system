
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Users, BookOpen, School, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ManageClasses } from "./admin/ManageClasses";
import { ManageTeachers } from "./admin/ManageTeachers";
import { ManageStudents } from "./admin/ManageStudents";

const AdminDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500">Manage students, teachers, and system settings.</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">--</div>
                            <p className="text-xs text-muted-foreground">Registered in system</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                            <School className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">--</div>
                            <p className="text-xs text-muted-foreground">Active faculty</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Classes</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">--</div>
                            <p className="text-xs text-muted-foreground">Courses offered</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Status</CardTitle>
                            <Settings className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">Active</div>
                            <p className="text-xs text-muted-foreground">All systems operational</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="students" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="teachers">Teachers</TabsTrigger>
                        <TabsTrigger value="classes">Classes & Subjects</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="students" className="space-y-4">
                        <ManageStudents />
                    </TabsContent>

                    <TabsContent value="teachers" className="space-y-4">
                        <ManageTeachers />
                    </TabsContent>

                    <TabsContent value="classes" className="space-y-4">
                        <ManageClasses />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminDashboard;
