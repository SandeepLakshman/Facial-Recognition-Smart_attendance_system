
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, COLLECTIONS } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import type { Student, Teacher, Admin, Role } from "@/lib/store";

interface UserProfile {
    id: string; // Firestore ID
    uid: string; // Firebase Auth ID
    role: Role;
    name: string;
    email: string;
    data: Student | Teacher | Admin;
}

interface AuthContextType {
    currentUser: UserProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
    isAdmin: boolean;
    isTeacher: boolean;
    isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // 1. Try to find user in Teachers
                    let q = query(collection(db, COLLECTIONS.TEACHERS), where("email", "==", firebaseUser.email));
                    let querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const docData = querySnapshot.docs[0].data() as Teacher;
                        setCurrentUser({
                            id: querySnapshot.docs[0].id,
                            uid: firebaseUser.uid,
                            role: "teacher",
                            name: docData.name,
                            email: docData.email,
                            data: docData
                        });
                        setLoading(false);
                        return;
                    }

                    // 2. Try to find user in Students
                    q = query(collection(db, COLLECTIONS.STUDENTS), where("email", "==", firebaseUser.email));
                    querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const docData = querySnapshot.docs[0].data() as Student;
                        setCurrentUser({
                            id: querySnapshot.docs[0].id,
                            uid: firebaseUser.uid,
                            role: "student",
                            name: docData.name,
                            email: docData.email,
                            data: docData
                        });
                        setLoading(false);
                        return;
                    }

                    // 3. Check for Admin (Hardcoded or collection)
                    if (firebaseUser.email === "admin@smartattend.com") { // Replace with better check later
                        setCurrentUser({
                            id: "admin",
                            uid: firebaseUser.uid,
                            role: "admin",
                            name: "System Administrator",
                            email: firebaseUser.email!,
                            data: { role: "admin", id: "admin", name: "Admin", email: firebaseUser.email! } as Admin
                        });
                        setLoading(false);
                        return;
                    }

                    // User authenticated in Firebase but not found in Firestore roles
                    console.warn("User authenticated but no profile found:", firebaseUser.email);
                    setCurrentUser(null);

                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
        // Optional: Clear local session if needed
    };

    const value = {
        currentUser,
        loading,
        logout,
        isAdmin: currentUser?.role === "admin",
        isTeacher: currentUser?.role === "teacher",
        isStudent: currentUser?.role === "student",
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
