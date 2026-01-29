/**
 * Firebase Service Layer
 * Professional, organized Firestore operations for the attendance system
 * All data operations go through this service for clean separation of concerns
 */

import {
  db,
  storage,
  COLLECTIONS,
  timestampToNumber,
  numberToTimestamp,
  docToObject,
  docsToArray
} from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
  Timestamp,
  writeBatch,
  limit
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Import types from store
import type {
  Student,
  Teacher,
  Section,
  Subject,
  AttendanceRecord,
  TopicLog,
  AuditLog,
  NotificationSettings,
  Role,
  Session
} from "./store";

// ==================== STUDENT OPERATIONS ====================

export const createStudentInFirebase = async (studentData: Omit<Student, "id" | "role" | "faceRegistered"> & { faceRegistered?: boolean; uid?: string }): Promise<Student> => {
  try {
    // Check if roll number already exists
    const rollNumberQuery = query(
      collection(db, COLLECTIONS.STUDENTS),
      where("rollNumber", "==", studentData.rollNumber)
    );
    const existingDocs = await getDocs(rollNumberQuery);

    if (!existingDocs.empty) {
      throw new Error("Roll number already exists");
    }

    // Create student document
    const studentRef = doc(collection(db, COLLECTIONS.STUDENTS));
    const student: Student = {
      id: studentRef.id,
      uid: studentData.uid,
      role: "student",
      name: studentData.name,
      email: studentData.email,
      rollNumber: studentData.rollNumber,
      sectionId: studentData.sectionId,
      faceRegistered: studentData.faceRegistered ?? false,
      guardianPhone: studentData.guardianPhone,
      alternatePhone: studentData.alternatePhone,
      consentFaceData: studentData.consentFaceData,
      consentParentNotify: studentData.consentParentNotify,
      department: studentData.department,
      password: studentData.password,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(studentRef, student);
    return student;
  } catch (error: any) {
    console.error("Error creating student:", error);
    throw error;
  }
};

export const getStudentFromFirebase = async (studentId: string): Promise<Student | null> => {
  try {
    const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) return null;

    const data = studentSnap.data();
    return {
      ...data,
      id: studentSnap.id
    } as Student;
  } catch (error) {
    console.error("Error getting student:", error);
    return null;
  }
};

export const updateStudentInFirebase = async (studentId: string, updates: Partial<Omit<Student, "id" | "role">>): Promise<Student | null> => {
  try {
    const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    await updateDoc(studentRef, updateData);

    // Return updated student
    const updatedSnap = await getDoc(studentRef);
    if (!updatedSnap.exists()) return null;

    return {
      ...updatedSnap.data(),
      id: updatedSnap.id
    } as Student;
  } catch (error) {
    console.error("Error updating student:", error);
    return null;
  }
};

export const findStudentByRollNumber = async (rollNumber: string): Promise<Student | null> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.STUDENTS),
      where("rollNumber", "==", rollNumber)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return {
      ...doc.data(),
      id: doc.id
    } as Student;
  } catch (error) {
    console.error("Error finding student by roll number:", error);
    return null;
  }
};

export const listStudentsBySection = async (sectionId: string): Promise<Student[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.STUDENTS),
      where("sectionId", "==", sectionId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Student[];
  } catch (error) {
    console.error("Error listing students by section:", error);
    return [];
  }
};

export const getAllStudents = async (): Promise<Student[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Student[];
  } catch (error) {
    console.error("Error getting all students:", error);
    return [];
  }
};




export const deleteStudentFromFirebase = async (studentId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.STUDENTS, studentId));
    return true;
  } catch (error) {
    console.error("Error deleting student:", error);
    return false;
  }
};

// ==================== TEACHER OPERATIONS ====================

export const createTeacherInFirebase = async (teacherData: Omit<Teacher, "id" | "role" | "sectionIds"> & { sectionIds?: string[]; uid?: string }): Promise<Teacher> => {
  try {
    // Check if employee ID already exists
    const employeeIdQuery = query(
      collection(db, COLLECTIONS.TEACHERS),
      where("employeeId", "==", teacherData.employeeId)
    );
    const existingDocs = await getDocs(employeeIdQuery);

    if (!existingDocs.empty) {
      throw new Error("Teacher ID already exists");
    }

    const teacherRef = doc(collection(db, COLLECTIONS.TEACHERS));
    const teacher: Teacher = {
      id: teacherRef.id,
      uid: teacherData.uid,
      role: "teacher",
      name: teacherData.name,
      email: teacherData.email,
      employeeId: teacherData.employeeId,
      sectionIds: teacherData.sectionIds ?? [],
      department: teacherData.department,
      phone: teacherData.phone,
      password: teacherData.password,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(teacherRef, teacher);
    return teacher;
  } catch (error: any) {
    console.error("Error creating teacher:", error);
    throw error;
  }
};

export const findTeacherByEmail = async (email: string): Promise<Teacher | null> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.TEACHERS),
      where("email", "==", email)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const doc = querySnapshot.docs[0];
    return {
      ...doc.data(),
      id: doc.id
    } as Teacher;
  } catch (error) {
    console.error("Error finding teacher by email:", error);
    return null;
  }
};

export const assignTeacherToSection = async (teacherId: string, sectionId: string): Promise<void> => {
  try {
    const batch = writeBatch(db);

    // Update teacher
    const teacherRef = doc(db, COLLECTIONS.TEACHERS, teacherId);
    const teacherSnap = await getDoc(teacherRef);
    if (teacherSnap.exists()) {
      const teacher = teacherSnap.data() as Teacher;
      const sectionIds = teacher.sectionIds || [];
      if (!sectionIds.includes(sectionId)) {
        batch.update(teacherRef, {
          sectionIds: [...sectionIds, sectionId],
          updatedAt: Timestamp.now()
        });
      }
    }

    // Update section
    const sectionRef = doc(db, COLLECTIONS.SECTIONS, sectionId);
    const sectionSnap = await getDoc(sectionRef);
    if (sectionSnap.exists()) {
      const section = sectionSnap.data() as Section;
      const teacherIds = section.teacherIds || [];
      if (!teacherIds.includes(teacherId)) {
        batch.update(sectionRef, {
          teacherIds: [...teacherIds, teacherId],
          updatedAt: Timestamp.now()
        });
      }
    }

    await batch.commit();
  } catch (error) {
    console.error("Error assigning teacher to section:", error);
    throw error;
  }
};

export const getAllTeachers = async (): Promise<Teacher[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.TEACHERS));
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Teacher[];
  } catch (error) {
    console.error("Error listing teachers:", error);
    return [];
  }
};

export const deleteTeacherFromFirebase = async (teacherId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.TEACHERS, teacherId));
    return true;
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return false;
  }
};

// ==================== SECTION OPERATIONS ====================

export const createSectionInFirebase = async (name: string): Promise<Section> => {
  try {
    // Check if section with same name exists
    const nameQuery = query(
      collection(db, COLLECTIONS.SECTIONS),
      where("name", "==", name)
    );
    const existingDocs = await getDocs(nameQuery);

    if (!existingDocs.empty) {
      throw new Error("Section with this name already exists");
    }

    const sectionRef = doc(collection(db, COLLECTIONS.SECTIONS));
    const section: Section = {
      id: sectionRef.id,
      name,
      subjectIds: [],
      teacherIds: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(sectionRef, section);
    return section;
  } catch (error: any) {
    console.error("Error creating section:", error);
    throw error;
  }
};

export const listSectionsFromFirebase = async (): Promise<Section[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.SECTIONS));
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Section[];
  } catch (error) {
    console.error("Error listing sections:", error);
    return [];
  }
};

export const deleteSectionFromFirebase = async (sectionId: string): Promise<boolean> => {
  try {
    // Remove section from all teachers
    const teachersQuery = query(collection(db, COLLECTIONS.TEACHERS));
    const teachersSnapshot = await getDocs(teachersQuery);
    const batch = writeBatch(db);

    teachersSnapshot.docs.forEach(teacherDoc => {
      const teacher = teacherDoc.data() as Teacher;
      if (teacher.sectionIds?.includes(sectionId)) {
        batch.update(teacherDoc.ref, {
          sectionIds: teacher.sectionIds.filter((id: string) => id !== sectionId),
          updatedAt: Timestamp.now()
        });
      }
    });

    // Delete the section
    const sectionRef = doc(db, COLLECTIONS.SECTIONS, sectionId);
    batch.delete(sectionRef);

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error deleting section:", error);
    return false;
  }
};

// ==================== SUBJECT OPERATIONS ====================

export const createSubjectInFirebase = async (name: string): Promise<Subject> => {
  try {
    const subjectRef = doc(collection(db, COLLECTIONS.SUBJECTS));
    const subject: Subject = {
      id: subjectRef.id,
      name,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await setDoc(subjectRef, subject);
    return subject;
  } catch (error) {
    console.error("Error creating subject:", error);
    throw error;
  }
};

export const listSubjectsFromFirebase = async (): Promise<Subject[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.SUBJECTS));
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Subject[];
  } catch (error) {
    console.error("Error listing subjects:", error);
    return [];
  }
};

export const addSubjectToSection = async (sectionId: string, subjectId: string): Promise<void> => {
  try {
    const sectionRef = doc(db, COLLECTIONS.SECTIONS, sectionId);
    const sectionSnap = await getDoc(sectionRef);

    if (sectionSnap.exists()) {
      const section = sectionSnap.data() as Section;
      const subjectIds = section.subjectIds || [];
      if (!subjectIds.includes(subjectId)) {
        await updateDoc(sectionRef, {
          subjectIds: [...subjectIds, subjectId],
          updatedAt: Timestamp.now()
        });
      }
    }
  } catch (error) {
    console.error("Error adding subject to section:", error);
    throw error;
  }
};

export const getSubjectsForSection = async (sectionId: string): Promise<Subject[]> => {
  try {
    const sectionRef = doc(db, COLLECTIONS.SECTIONS, sectionId);
    const sectionSnap = await getDoc(sectionRef);

    if (!sectionSnap.exists()) return [];

    const section = sectionSnap.data() as Section;
    const subjectIds = section.subjectIds || [];

    if (subjectIds.length === 0) return [];

    // Get all subjects
    // Get all subjects in parallel
    const subjectPromises = subjectIds.map(async (subjectId) => {
      const subjectRef = doc(db, COLLECTIONS.SUBJECTS, subjectId);
      const subjectSnap = await getDoc(subjectRef);
      if (subjectSnap.exists()) {
        return {
          ...subjectSnap.data(),
          id: subjectSnap.id
        } as Subject;
      }
      return null;
    });

    const results = await Promise.all(subjectPromises);
    const subjects = results.filter((s): s is Subject => s !== null);

    return subjects;
  } catch (error) {
    console.error("Error getting subjects for section:", error);
    return [];
  }
};

export const deleteSubjectFromFirebase = async (subjectId: string): Promise<boolean> => {
  try {
    // Remove subject from all sections
    const sectionsQuery = query(collection(db, COLLECTIONS.SECTIONS));
    const sectionsSnapshot = await getDocs(sectionsQuery);
    const batch = writeBatch(db);

    sectionsSnapshot.docs.forEach(sectionDoc => {
      const section = sectionDoc.data() as Section;
      if (section.subjectIds?.includes(subjectId)) {
        batch.update(sectionDoc.ref, {
          subjectIds: section.subjectIds.filter((id: string) => id !== subjectId),
          updatedAt: Timestamp.now()
        });
      }
    });

    // Delete the subject
    const subjectRef = doc(db, COLLECTIONS.SUBJECTS, subjectId);
    batch.delete(subjectRef);

    await batch.commit();
    return true;
  } catch (error) {
    console.error("Error deleting subject:", error);
    return false;
  }
};

// ==================== ATTENDANCE OPERATIONS ====================

export const addAttendanceToFirebase = async (
  record: Omit<AttendanceRecord, "id" | "timestamp"> & { timestamp?: number }
): Promise<AttendanceRecord> => {
  try {
    const attendanceRef = doc(collection(db, COLLECTIONS.ATTENDANCE_LOGS));
    const attendance: AttendanceRecord = {
      id: attendanceRef.id,
      studentId: record.studentId,
      subjectId: record.subjectId,
      teacherId: record.teacherId,
      sectionId: record.sectionId,
      timestamp: record.timestamp ?? Date.now(),
      period: record.period,
      topic: record.topic,
      present: record.present,
      createdAt: Timestamp.now()
    };

    await setDoc(attendanceRef, attendance);

    // Create audit log
    try {
      const auditRef = doc(collection(db, COLLECTIONS.AUDITS));
      const audit: AuditLog = {
        id: auditRef.id,
        actorId: record.teacherId,
        actorRole: "teacher",
        action: "add_attendance",
        target: record.studentId,
        timestamp: Date.now(),
        details: {
          subjectId: record.subjectId,
          sectionId: record.sectionId,
          period: record.period,
          present: record.present
        },
        createdAt: Timestamp.now()
      };
      await setDoc(auditRef, audit);
    } catch (auditError) {
      console.warn("Failed to create audit log:", auditError);
    }

    return attendance;
  } catch (error) {
    console.error("Error adding attendance:", error);
    throw error;
  }
};

export const getAttendanceForStudent = async (studentId: string): Promise<AttendanceRecord[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.ATTENDANCE_LOGS),
      where("studentId", "==", studentId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as AttendanceRecord[];
  } catch (error) {
    console.error("Error getting attendance for student:", error);
    return [];
  }
};

export const getAttendanceForSection = async (sectionId: string, subjectId?: string): Promise<AttendanceRecord[]> => {
  try {
    let q;
    if (subjectId) {
      q = query(
        collection(db, COLLECTIONS.ATTENDANCE_LOGS),
        where("sectionId", "==", sectionId),
        where("subjectId", "==", subjectId),
        orderBy("timestamp", "desc")
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.ATTENDANCE_LOGS),
        where("sectionId", "==", sectionId),
        orderBy("timestamp", "desc")
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...(doc.data() as any),
      id: doc.id
    })) as AttendanceRecord[];
  } catch (error) {
    console.error("Error getting attendance for section:", error);
    return [];
  }
};

// ==================== FACE IMAGE STORAGE ====================

export const uploadFaceImage = async (
  studentId: string,
  imageBlob: Blob,
  imageIndex: number
): Promise<string> => {
  try {
    const imagePath = `face-images/${studentId}/image_${imageIndex}_${Date.now()}.jpg`;
    const imageRef = ref(storage, imagePath);

    await uploadBytes(imageRef, imageBlob, {
      contentType: "image/jpeg",
      customMetadata: {
        studentId,
        imageIndex: imageIndex.toString(),
        uploadedAt: new Date().toISOString()
      }
    });

    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading face image:", error);
    throw error;
  }
};

export const saveFaceImageMetadata = async (
  studentId: string,
  imageURLs: string[],
  faceFeatures: number[][]
): Promise<void> => {
  try {
    const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
    await updateDoc(studentRef, {
      faceImageMetadata: {
        imageURLs,
        faceFeatures,
        sampleCount: imageURLs.length,
        updatedAt: Timestamp.now(),
        createdAt: Timestamp.now()
      }
    });
    console.log(`✅ Saved face image metadata for student ${studentId}`);
  } catch (error) {
    console.error("Error saving face image metadata:", error);
    throw error;
  }
};

export const getFaceImageMetadata = async (studentId: string): Promise<{ imageURLs: string[]; faceFeatures: number[][] } | null> => {
  try {
    const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) return null;

    const data = studentSnap.data();
    // Check for new format first
    if (data.faceImageMetadata) {
      return {
        imageURLs: data.faceImageMetadata.imageURLs || [],
        faceFeatures: data.faceImageMetadata.faceFeatures || []
      };
    }

    // Fallback: checks deprecated collection if needed, but for "one firestore" we prefer the student doc
    // If you need legacy support here, you'd query COLLECTIONS.FACE_DATA
    return null;
  } catch (error) {
    console.error("Error getting face image metadata:", error);
    return null;
  }
};

// Save face descriptors to Firebase (directly to student profile)
export const saveFaceDescriptors = async (
  studentId: string,
  descriptors: number[][] // Array of descriptor arrays (128 numbers each)
): Promise<void> => {
  try {
    const studentRef = doc(db, COLLECTIONS.STUDENTS, studentId);

    // Firestore doesn't support nested arrays, so we convert to an object structure
    // Store each descriptor as a separate field or flatten the structure
    const descriptorsObject: Record<string, number[]> = {};
    descriptors.forEach((desc, index) => {
      descriptorsObject[`desc_${index}`] = desc; // Store as desc_0, desc_1, etc.
    });

    await updateDoc(studentRef, {
      faceDescriptors: descriptorsObject, // Store in student document
      faceDescriptorCount: descriptors.length,
      faceRegistered: true,
      updatedAt: Timestamp.now()
    });
    console.log(`✅ Saved ${descriptors.length} face descriptors for student ${studentId}`);
  } catch (error) {
    console.error("Error saving face descriptors:", error);
    throw error;
  }
};

// Load face descriptors for a specific section (Optimized)
export const loadFaceDescriptorsForSection = async (sectionId: string): Promise<Map<string, number[][]>> => {
  try {
    console.log(`🔄 Loading face descriptors for section: ${sectionId}`);
    const students = await listStudentsBySection(sectionId);
    const descriptorsMap = new Map<string, number[][]>();

    students.forEach(student => {
      // Check if student has face descriptors
      // @ts-ignore - Dynamic field
      const faceDescriptorsObj = student.faceDescriptors;

      if (faceDescriptorsObj && typeof faceDescriptorsObj === 'object') {
        const descriptors = Object.keys(faceDescriptorsObj)
          .sort()
          .map(key => faceDescriptorsObj[key])
          .filter(desc => Array.isArray(desc) && (desc.length === 128 || desc.length === 100 || desc.length > 50));

        if (descriptors.length > 0) {
          descriptorsMap.set(student.rollNumber, descriptors);
        }
      }
    });

    console.log(`✅ Loaded descriptors for ${descriptorsMap.size} students in section ${sectionId}`);
    return descriptorsMap;
  } catch (error) {
    console.error(`Error loading face descriptors for section ${sectionId}:`, error);
    return new Map();
  }
};

// Fallback: Load all (Legacy support)
export const loadAllFaceDescriptors = async (): Promise<Map<string, number[][]>> => {
  try {
    // Try loading from students collection first (New Schema)
    const allStudents = await getAllStudents();
    const descriptorsMap = new Map<string, number[][]>();

    allStudents.forEach(student => {
      // @ts-ignore
      if (student.faceDescriptors) {
        // @ts-ignore
        const faceDescriptorsObj = student.faceDescriptors;
        const descriptors = Object.keys(faceDescriptorsObj)
          .sort()
          .map(key => faceDescriptorsObj[key])
          .filter(desc => Array.isArray(desc) && (desc.length === 128 || desc.length === 100 || desc.length > 50));

        if (descriptors.length > 0) {
          descriptorsMap.set(student.rollNumber, descriptors);
        }
      }
    });

    if (descriptorsMap.size > 0) {
      return descriptorsMap;
    }

    // If no new data, try legacy collection
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.FACE_DATA));

    const legacyDescriptorsMap = new Map<string, number[][]>();

    // Get all students to map studentId to rollNumber
    // @ts-ignore
    const studentsList = await getAllStudents();
    const studentIdToRollMap = new Map<string, string>();
    studentsList.forEach(student => {
      studentIdToRollMap.set(student.id, student.rollNumber);
    });

    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const studentId = data.studentId;
      const rollNumber = studentIdToRollMap.get(studentId) || studentId;

      let descriptors: number[][] = [];

      // Handle both formats: object format (new) and array format (old)
      if (data.descriptorFormat === "object" && data.descriptors && typeof data.descriptors === 'object') {
        // Convert object format back to array
        const descObject = data.descriptors as Record<string, number[]>;
        descriptors = Object.keys(descObject)
          .sort() // Sort to maintain order (desc_0, desc_1, etc.)
          .map(key => descObject[key])
          .filter(desc => Array.isArray(desc) && desc.length === 128);
      } else if (Array.isArray(data.descriptors) && data.descriptors.length > 0) {
        // Legacy format: nested array (if somehow it exists)
        descriptors = data.descriptors.filter((desc: any) => Array.isArray(desc) && desc.length === 128);
      }

      if (descriptors.length > 0) {
        legacyDescriptorsMap.set(rollNumber, descriptors);
        console.log(`✅ Loaded ${descriptors.length} descriptors for student ${rollNumber} (ID: ${studentId})`);
      } else {
        console.warn(`⚠️ No valid descriptors found for student ${rollNumber} (ID: ${studentId})`);
      }
    });

    console.log(`✅ Loaded face descriptors for ${legacyDescriptorsMap.size} students from Firebase`);
    return legacyDescriptorsMap;
  } catch (error) {
    console.error("Error loading face descriptors:", error);
    return new Map();
  }
};

// ==================== SESSION MANAGEMENT ====================

// NEW: Server-Side Session Management (Multi-User)
export const createAttendanceSession = async (
  teacherId: string,
  sectionId: string,
  subjectId: string,
  mode: "demo" | "live",
  durationMinutes: number = 60
): Promise<Session> => {
  try {
    // 1. Check if there is already an active session for this section
    const q = query(
      collection(db, COLLECTIONS.SESSIONS),
      where("sectionId", "==", sectionId),
      where("isActive", "==", true)
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      throw new Error("A session is already active for this class section.");
    }

    // 2. Create new session
    const sessionRef = doc(collection(db, COLLECTIONS.SESSIONS));
    const startTime = Date.now();
    const endTime = startTime + (durationMinutes * 60 * 1000);
    const code = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code

    const newSession: Session = {
      id: sessionRef.id,
      teacherId,
      sectionId,
      subjectId,
      isActive: true,
      mode,
      startTime,
      endTime,
      expiresAt: endTime,
      code,
      createdAt: Timestamp.now()
    };

    await setDoc(sessionRef, newSession);
    return newSession;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
};

export const endAttendanceSession = async (sessionId: string): Promise<void> => {
  try {
    const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
    await updateDoc(sessionRef, {
      isActive: false,
      endTime: Date.now() // Actual end time
    });
  } catch (error) {
    console.error("Error ending session:", error);
    throw error;
  }
};

export const getActiveSessionForSection = async (sectionId: string): Promise<Session | null> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.SESSIONS),
      where("sectionId", "==", sectionId),
      where("isActive", "==", true)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    // Check expiry
    const sessionData = snapshot.docs[0].data() as Session;
    if (sessionData.expiresAt < Date.now()) {
      // Auto-close if expired (lazy cleanup)
      await endAttendanceSession(snapshot.docs[0].id);
      return null;
    }

    return { ...sessionData, id: snapshot.docs[0].id };


  } catch (error) {
    console.error("Error getting active session:", error);
    return null;
  }
};

export const getSessionsForTeacher = async (teacherId: string): Promise<Session[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.SESSIONS),
      where("teacherId", "==", teacherId),
      orderBy("startTime", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Session[];
  } catch (error) {
    console.error("Error getting sessions:", error);
    return [];
  }
};

export const markSessionAttendance = async (sessionId: string, rollNumber: string): Promise<boolean> => {
  try {
    // 1. Get Session Details
    const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
    const sessionSnap = await getDoc(sessionRef);
    if (!sessionSnap.exists()) throw new Error("Session not found");
    const session = sessionSnap.data() as Session;
    if (!session.isActive) throw new Error("Session is inactive");

    // 2. Find Student by Roll Number (since FaceAPI returns roll/label)
    const student = await findStudentByRollNumber(rollNumber); // Assuming this helper exists or we use getAllStudents
    if (!student) throw new Error("Student not found");

    // 3. Check for existing record
    const q = query(
      collection(db, COLLECTIONS.ATTENDANCE_LOGS),
      where("studentId", "==", student.id),
      where("sectionId", "==", session.sectionId),
      where("subjectId", "==", session.subjectId),
      // Optional: check within time range to prevent dupes
      where("timestamp", ">", session.startTime)
    );
    const existing = await getDocs(q);
    if (!existing.empty) return true; // Already marked

    // 4. Create Record
    const attendanceRef = doc(collection(db, COLLECTIONS.ATTENDANCE_LOGS));
    const record: AttendanceRecord = {
      id: attendanceRef.id,
      studentId: student.id,
      subjectId: session.subjectId,
      teacherId: session.teacherId, // Or 'SYSTEM'
      sectionId: session.sectionId,
      timestamp: Date.now(),
      period: 0, // Calculate or ignore
      present: true,
      createdAt: Timestamp.now()
    };
    await setDoc(attendanceRef, record);
    return true;
  } catch (error) {
    console.error("Error marking session attendance:", error);
    throw error;
  }
};

// Legacy Local Session Helpers (Kept for compatibility if needed, but we rely on AuthContext now)
export const saveSessionToFirebase = async (session: { role: Role; userId: string } | null): Promise<void> => {
  try {
    // Store session in localStorage for quick access (Firebase Auth would be better for production)
    localStorage.setItem("smartattend-session", JSON.stringify(session));
  } catch (error) {
    console.error("Error saving session:", error);
  }
};

export const getSessionFromFirebase = (): { role: Role; userId: string } | null => {
  try {
    const sessionStr = localStorage.getItem("smartattend-session");
    if (!sessionStr) return null;
    return JSON.parse(sessionStr);
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};

export const clearSessionFromFirebase = (): void => {
  localStorage.removeItem("smartattend-session");
};

// ==================== AUTHENTICATION HELPERS ====================

export const verifyStudentLogin = async (rollNumber: string, password: string): Promise<Student | null> => {
  try {
    const student = await findStudentByRollNumber(rollNumber);
    if (!student || student.password !== password) {
      return null;
    }
    return student;
  } catch (error) {
    console.error("Error verifying student login:", error);
    return null;
  }
};

export const verifyTeacherLogin = async (employeeId: string, password: string): Promise<Teacher | null> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.TEACHERS),
      where("employeeId", "==", employeeId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    const teacherDoc = querySnapshot.docs[0];
    const teacher = {
      ...teacherDoc.data(),
      id: teacherDoc.id
    } as Teacher;

    if (teacher.password !== password) {
      return null;
    }

    return teacher;
  } catch (error) {
    console.error("Error verifying teacher login:", error);
    return null;
  }
};

// ==================== REAL-TIME SUBSCRIPTIONS ====================

// ==================== TIMETABLE & AUTOMATION ====================

// Get timetable entry for current time
export const getTimetableForNow = async (): Promise<{ sectionId: string; subjectId: string; period: number } | null> => {
  try {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    console.log(`🕒 Checking timetable for Day ${day} at ${currentTime}`);

    if (day === 0 || day === 6) return null; // Weekend

    const q = query(
      collection(db, COLLECTIONS.TIMETABLE),
      where("day", "==", day)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No classes scheduled for today.");
      return null;
    }

    // Client-side filtering for time range to ensure exact match
    const activeClassDoc = snapshot.docs.find(doc => {
      const data = doc.data();
      // Check if current time is within slot (inclusive start, exclusive end)
      return currentTime >= data.startTime && currentTime <= data.endTime;
    });

    if (activeClassDoc) {
      const data = activeClassDoc.data();
      console.log(`✅ Found active class: ${data.subjectId} (Period ${data.period})`);
      return {
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        period: data.period
      };
    }

    console.log("No class currently active in this time slot.");
    return null;

  } catch (error) {
    console.error("Error getting timetable for now:", error);
    return null;
  }
};

// Mark missing students as absent
/*
export const processAbsentees = async (
  sectionId: string,
  presentStudentIds: string[],
  subjectId?: string,
  period?: number
): Promise<{ processed: number; absentees: string[] }> => {
    return { processed: 0, absentees: [] };
};
*/

export const subscribeToStudents = (
  sectionId: string | null,
  callback: (students: Student[]) => void
): Unsubscribe => {
  let q;
  if (sectionId) {
    q = query(
      collection(db, COLLECTIONS.STUDENTS),
      where("sectionId", "==", sectionId)
    );
  } else {
    q = query(collection(db, COLLECTIONS.STUDENTS));
  }

  return onSnapshot(q, (snapshot) => {
    const students = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as Student[];
    callback(students);
  });
};

export const subscribeToAttendance = (
  studentId: string,
  callback: (records: AttendanceRecord[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, COLLECTIONS.ATTENDANCE_LOGS),
    where("studentId", "==", studentId)
  );

  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as AttendanceRecord[];
    callback(records);
  });
};

