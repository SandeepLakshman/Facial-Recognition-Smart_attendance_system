// Firebase-backed data store and types
// All data operations now use Firebase Firestore for cloud storage

import {
  getSessionFromFirebase,
  saveSessionToFirebase,
  clearSessionFromFirebase,
  createTeacherInFirebase,
  getAllTeachers,
  deleteTeacherFromFirebase,
  findTeacherByEmail as findTeacherByEmailService,
  assignTeacherToSection as assignTeacherToSectionService,
  createStudentInFirebase,
  getAllStudents,
  deleteStudentFromFirebase,
  verifyStudentLogin as verifyStudentLoginService,
  verifyTeacherLogin as verifyTeacherLoginService,
  updateStudentInFirebase,
  findStudentByRollNumber,
  listStudentsBySection as listStudentsBySectionService,
  createSectionInFirebase,
  listSectionsFromFirebase,
  createSubjectInFirebase,
  listSubjectsFromFirebase,
  addSubjectToSection as addSubjectToSectionService,
  getSubjectsForSection as getSubjectsForSectionService,
  deleteSubjectFromFirebase,
  deleteSectionFromFirebase,
  addAttendanceToFirebase,
  getAttendanceForStudent as getAttendanceForStudentService,
  getSessionsForTeacher // Add import
} from "./firebaseService";

// ... existing code ...

// Helper to list sessions for a teacher
export async function listTeacherSessions(teacherId: string): Promise<Session[]> {
  return await getSessionsForTeacher(teacherId);
}

export type Role = "student" | "teacher" | "admin";

export interface Subject {
  id: string;
  name: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Section {
  id: string;
  name: string; // e.g., CSE-A, CSE-B
  subjectIds: string[]; // subjects offered in this section
  teacherIds: string[]; // teachers assigned to this section
  createdAt?: any;
  updatedAt?: any;
}

export interface BaseUser {
  id: string;
  uid?: string; // Firebase Auth UID link
  name: string;
  email: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Teacher extends BaseUser {
  role: "teacher";
  employeeId: string;
  sectionIds: string[];
  department?: string;
  phone?: string;
  password?: string;
}

export interface Admin extends BaseUser {
  role: "admin";
}

export interface Student extends BaseUser {
  role: "student";
  rollNumber: string;
  sectionId: string;
  faceRegistered: boolean;
  guardianPhone?: string;
  alternatePhone?: string;
  consentFaceData?: boolean;
  consentParentNotify?: boolean;
  department?: string;
  password?: string;
}

// Session Interface
export interface Session {
  id: string;
  teacherId: string;
  sectionId: string;
  subjectId: string;
  isActive: boolean;
  mode: "demo" | "live";
  startTime: number;
  endTime: number;
  expiresAt: number;
  code: string;
  createdAt: any;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  teacherId: string;
  sectionId: string;
  timestamp: number;
  period: number; // 1..8
  topic?: string;
  present: boolean;
  createdAt?: any;
}

export interface TopicLog {
  id: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  period: number;
  timestamp: number;
  title: string;
  resources?: string;
  homework?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: Role;
  action: string;
  target?: string;
  timestamp: number;
  details?: Record<string, unknown>;
  createdAt?: any;
}

export interface NotificationSettings {
  absentNotifyMode: "every" | "consecutive" | "threshold" | "off";
  consecutiveAbsences?: number;
  percentThreshold?: number;
}

export interface Database {
  subjects: Record<string, Subject>;
  sections: Record<string, Section>;
  students: Record<string, Student>;
  teachers: Record<string, Teacher>;
  attendance: Record<string, AttendanceRecord>;
  session: { role: Role; userId: string } | null; // Legacy: Local user session
  activeAttendanceSession: Session | null; // New: Active class session
  topics: Record<string, TopicLog>;
  audits: Record<string, AuditLog>;
  settings: { notifications: NotificationSettings };
}

// New Session Interface for Smart Attendance


// Session helpers - using Firebase
export function getSession(): { role: Role; userId: string } | null {
  return getSessionFromFirebase();
}

export function setSession(session: Database["session"]): void {
  saveSessionToFirebase(session);
}

export function clearSession(): void {
  clearSessionFromFirebase();
}

// Teacher CRUD - using Firebase
export async function createTeacher(input: Omit<Teacher, "id" | "role" | "sectionIds"> & { sectionIds?: string[]; uid?: string }): Promise<Teacher> {
  return await createTeacherInFirebase(input);
}

export async function listAllTeachers(): Promise<Teacher[]> {
  return await getAllTeachers();
}

export async function deleteTeacher(teacherId: string): Promise<boolean> {
  return await deleteTeacherFromFirebase(teacherId);
}

export async function findTeacherByEmail(email: string): Promise<Teacher | undefined> {
  return await findTeacherByEmailService(email) || undefined;
}

export async function assignTeacherToSection(teacherId: string, sectionId: string): Promise<void> {
  await assignTeacherToSectionService(teacherId, sectionId);
}

// Student CRUD - using Firebase
export async function createStudent(input: Omit<Student, "id" | "role" | "faceRegistered"> & { faceRegistered?: boolean; uid?: string }): Promise<Student> {
  return await createStudentInFirebase(input);
}

export async function listAllStudents(): Promise<Student[]> {
  return await getAllStudents();
}

export async function deleteStudent(studentId: string): Promise<boolean> {
  return await deleteStudentFromFirebase(studentId);
}

export async function verifyStudentLogin(rollNumber: string, password: string): Promise<Student | undefined> {
  return await verifyStudentLoginService(rollNumber, password) || undefined;
}

export async function verifyTeacherLogin(employeeId: string, password: string): Promise<Teacher | undefined> {
  return await verifyTeacherLoginService(employeeId, password) || undefined;
}

export async function updateStudent(studentId: string, updates: Partial<Omit<Student, "id" | "role">>): Promise<Student | undefined> {
  return await updateStudentInFirebase(studentId, updates) || undefined;
}

export async function findStudentByRoll(rollNumber: string): Promise<Student | undefined> {
  return await findStudentByRollNumber(rollNumber) || undefined;
}

export async function listStudentsBySection(sectionId: string): Promise<Student[]> {
  return await listStudentsBySectionService(sectionId);
}

// Section & Subject CRUD - using Firebase
export async function createSection(name: string): Promise<Section> {
  return await createSectionInFirebase(name);
}

export async function listSections(): Promise<Section[]> {
  return await listSectionsFromFirebase();
}

export async function createSubject(name: string): Promise<Subject> {
  return await createSubjectInFirebase(name);
}

export async function listSubjects(): Promise<Subject[]> {
  return await listSubjectsFromFirebase();
}

export async function addSubjectToSection(sectionId: string, subjectId: string): Promise<void> {
  await addSubjectToSectionService(sectionId, subjectId);
}

export async function getSubjectsForSection(sectionId: string): Promise<Subject[]> {
  return await getSubjectsForSectionService(sectionId);
}

export async function deleteSubject(subjectId: string): Promise<boolean> {
  return await deleteSubjectFromFirebase(subjectId);
}

export async function deleteSection(sectionId: string): Promise<boolean> {
  return await deleteSectionFromFirebase(sectionId);
}

export async function removeSubjectFromSection(sectionId: string, subjectId: string): Promise<boolean> {
  // This would need to be implemented in firebaseService if needed
  // For now, we can get the section, remove the subject, and update
  try {
    const sections = await listSections();
    const section = sections.find(s => s.id === sectionId);
    if (!section) return false;

    const updatedSubjectIds = section.subjectIds.filter(id => id !== subjectId);
    // Note: This would require an updateSection function in firebaseService
    // For now, return false to indicate it needs implementation
    return false;
  } catch {
    return false;
  }
}

// Attendance - using Firebase
export async function addAttendance(record: Omit<AttendanceRecord, "id" | "timestamp"> & { timestamp?: number }): Promise<AttendanceRecord> {
  return await addAttendanceToFirebase(record);
}

export async function getAttendanceForStudent(studentId: string): Promise<AttendanceRecord[]> {
  return await getAttendanceForStudentService(studentId);
}

// Utility to bootstrap demo data if empty - using Firebase
export async function ensureDemoSeed(): Promise<void> {
  try {
    const sections = await listSections();
    // Expo Check: If "ECE-A" doesn't exist, we MUST seed the full expo data
    const hasExpoData = sections.some(s => s.name === "ECE-A");

    if (hasExpoData) {
      console.log('✅ Expo Demo data already exists (skipping seed).');
      return;
    }

    console.log('🌱 Seeding Expo Demo Data...');

    // 1. Create Branches & Sections
    const cseA = await createSection("CSE-A");
    const cseB = await createSection("CSE-B");
    const eceA = await createSection("ECE-A");
    const mechA = await createSection("MECH-A");

    // 2. Create Subjects (Branch Specific)
    // CSE
    const subDs = await createSubject("Data Structures");
    const subOs = await createSubject("Operating Systems");
    const subAi = await createSubject("Artificial Intelligence");

    // ECE
    const subDe = await createSubject("Digital Electronics");
    const subSig = await createSubject("Signals & Systems");

    // MECH
    const subThermo = await createSubject("Thermodynamics");
    const subFluid = await createSubject("Fluid Mechanics");

    // 3. Map Subjects to Sections
    await addSubjectToSection(cseA.id, subDs.id);
    await addSubjectToSection(cseA.id, subOs.id);
    await addSubjectToSection(cseA.id, subAi.id);

    await addSubjectToSection(cseB.id, subDs.id); // Shared subject

    await addSubjectToSection(eceA.id, subDe.id);
    await addSubjectToSection(eceA.id, subSig.id);

    await addSubjectToSection(mechA.id, subThermo.id);
    await addSubjectToSection(mechA.id, subFluid.id);

    console.log('✅ Created Sections & Subjects');

    // 4. Create Teachers (One per Dept for Demo)
    const teachers = [
      {
        name: "Dr. Alan Turing",
        email: "cse@college.edu",
        employeeId: "CSE001",
        sectionIds: [cseA.id, cseB.id],
        department: "Computer Science",
        password: "password123"
      },
      {
        name: "Prof. Faraday",
        email: "ece@college.edu",
        employeeId: "ECE001",
        sectionIds: [eceA.id],
        department: "Electronics",
        password: "password123"
      },
      {
        name: "Dr. Newton",
        email: "mech@college.edu",
        employeeId: "MECH001",
        sectionIds: [mechA.id],
        department: "Mechanical",
        password: "password123"
      }
    ];

    for (const t of teachers) {
      await createTeacher({
        name: t.name,
        email: t.email,
        employeeId: t.employeeId,
        sectionIds: t.sectionIds,
        department: t.department,
        password: t.password,
        phone: "9999999999"
      });
    }
    console.log('✅ Created Demo Teachers (Login: cse@college.edu / password123)');

    // 5. Create Students (Few for each class)
    const students = [
      // CSE-A
      { name: "Tejas (Pro)", rollNumber: "CSE101", sectionId: cseA.id, email: "tejas@student.edu" },
      { name: "Rahul Sharma", rollNumber: "CSE102", sectionId: cseA.id, email: "rahul@student.edu" },
      // ECE-A
      { name: "Aditi Rao", rollNumber: "ECE101", sectionId: eceA.id, email: "aditi@student.edu" },
      // MECH-A
      { name: "Vikram Singh", rollNumber: "MECH101", sectionId: mechA.id, email: "vikram@student.edu" }
    ];

    for (const s of students) {
      await createStudent({
        ...s,
        faceRegistered: false, // They need to register face
        password: "password123"
      });
    }

    console.log('✅ Demo Seed Complete! Ready for Expo.');

  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
}


