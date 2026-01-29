# Firestore Database Structure Guide
## Clean, Organized Schema for SmartAttend System

This document provides a **recommended clean database structure** for organizing your Firestore collections and fields. The current application code will continue to work with existing collections, but this guide shows how to structure new data and organize existing data for better maintainability.

---

## 📋 Table of Contents
1. [Collection Overview](#collection-overview)
2. [Students Collection](#students-collection)
3. [Teachers Collection](#teachers-collection)
4. [Sections Collection](#sections-collection)
5. [Subjects Collection](#subjects-collection)
6. [Attendance Collection](#attendance-collection)
6. [Face Data Collection](#face-data-collection)
7. [Audit Logs Collection](#audit-logs-collection)
8. [Field Organization Best Practices](#field-organization-best-practices)
9. [Indexing Recommendations](#indexing-recommendations)

---

## Collection Overview

### Current Collections (Keep These)
- ✅ `students` - Student information
- ✅ `teachers` - Teacher information
- ✅ `sections` - Class sections
- ✅ `subjects` - Course subjects
- ✅ `attendance` - Attendance records
- ✅ `faceData` - Face recognition data
- ✅ `audits` - Audit logs (if exists)

---

## Students Collection

### Document Structure
```typescript
{
  // ========== IDENTIFIERS ==========
  id: string;                    // Auto-generated document ID
  rollNumber: string;            // Unique student roll number (e.g., "27eg1")
  role: "student";               // Fixed role identifier
  
  // ========== PERSONAL INFORMATION ==========
  name: string;                  // Full name (e.g., "Sandeep")
  email: string;                 // Email address (can be empty)
  department: string;            // Department (e.g., "CSE")
  
  // ========== ACADEMIC INFORMATION ==========
  sectionId: string;             // Reference to section document ID
  faceRegistered: boolean;       // Whether face is registered (default: false)
  
  // ========== CONTACT INFORMATION ==========
  guardianPhone: string;         // Primary guardian phone
  alternatePhone: string;         // Alternate phone (can be empty)
  
  // ========== CONSENT & PRIVACY ==========
  consentFaceData: boolean;      // Consent for face data storage
  consentParentNotify: boolean;   // Consent for parent notifications
  
  // ========== AUTHENTICATION ==========
  password: string;              // Hashed password (consider using Firebase Auth)
  
  // ========== METADATA ==========
  createdAt: Timestamp;          // Document creation timestamp
  updatedAt: Timestamp;          // Last update timestamp
}
```

### Field Organization (Recommended Order)
1. **Identifiers** (id, rollNumber, role)
2. **Personal Info** (name, email, department)
3. **Academic Info** (sectionId, faceRegistered)
4. **Contact Info** (guardianPhone, alternatePhone)
5. **Consent** (consentFaceData, consentParentNotify)
6. **Authentication** (password)
7. **Metadata** (createdAt, updatedAt)

### Example Document
```json
{
  "id": "1Lz3UibnQXvOPgSk9fYb",
  "rollNumber": "27eg1",
  "role": "student",
  "name": "Sandeep",
  "email": "sandeep@example.com",
  "department": "CSE",
  "sectionId": "section_abc123",
  "faceRegistered": true,
  "guardianPhone": "8731888971",
  "alternatePhone": "",
  "consentFaceData": true,
  "consentParentNotify": true,
  "password": "hashed_password_here",
  "createdAt": "2025-12-13T01:59:43Z",
  "updatedAt": "2025-12-13T02:15:00Z"
}
```

---

## Teachers Collection

### Document Structure
```typescript
{
  // ========== IDENTIFIERS ==========
  id: string;                    // Auto-generated document ID
  employeeId: string;            // Unique employee ID
  role: "teacher";               // Fixed role identifier
  
  // ========== PERSONAL INFORMATION ==========
  name: string;                  // Full name
  email: string;                 // Email address
  department: string;            // Department (e.g., "CSE", "ECE")
  phone: string;                 // Contact phone number
  
  // ========== ACADEMIC INFORMATION ==========
  sectionIds: string[];          // Array of section document IDs
  
  // ========== AUTHENTICATION ==========
  password: string;              // Hashed password (consider using Firebase Auth)
  
  // ========== METADATA ==========
  createdAt: Timestamp;          // Document creation timestamp
  updatedAt: Timestamp;          // Last update timestamp
}
```

### Field Organization (Recommended Order)
1. **Identifiers** (id, employeeId, role)
2. **Personal Info** (name, email, department, phone)
3. **Academic Info** (sectionIds)
4. **Authentication** (password)
5. **Metadata** (createdAt, updatedAt)

### Example Document
```json
{
  "id": "teacher_xyz789",
  "employeeId": "TECH001",
  "role": "teacher",
  "name": "Dr. John Smith",
  "email": "john.smith@university.edu",
  "department": "CSE",
  "phone": "+91-9876543210",
  "sectionIds": ["section_abc123", "section_def456"],
  "password": "hashed_password_here",
  "createdAt": "2025-12-01T10:00:00Z",
  "updatedAt": "2025-12-13T09:30:00Z"
}
```

---

## Sections Collection

### Document Structure
```typescript
{
  // ========== IDENTIFIERS ==========
  id: string;                    // Auto-generated document ID
  name: string;                  // Section name (e.g., "CSE-A", "CSE-B")
  
  // ========== ACADEMIC INFORMATION ==========
  subjectIds: string[];          // Array of subject document IDs
  teacherIds: string[];          // Array of teacher document IDs
  
  // ========== METADATA ==========
  createdAt: Timestamp;          // Document creation timestamp
  updatedAt: Timestamp;          // Last update timestamp
}
```

### Field Organization (Recommended Order)
1. **Identifiers** (id, name)
2. **Academic Info** (subjectIds, teacherIds)
3. **Metadata** (createdAt, updatedAt)

### Example Document
```json
{
  "id": "section_abc123",
  "name": "CSE-A",
  "subjectIds": ["subject_math101", "subject_ds201", "subject_java301"],
  "teacherIds": ["teacher_xyz789", "teacher_abc456"],
  "createdAt": "2025-12-01T08:00:00Z",
  "updatedAt": "2025-12-10T14:20:00Z"
}
```

---

## Subjects Collection

### Document Structure
```typescript
{
  // ========== IDENTIFIERS ==========
  id: string;                    // Auto-generated document ID
  name: string;                  // Subject name (e.g., "Mathematics", "Data Structures")
  
  // ========== METADATA ==========
  createdAt: Timestamp;          // Document creation timestamp
  updatedAt: Timestamp;          // Last update timestamp
}
```

### Field Organization (Recommended Order)
1. **Identifiers** (id, name)
2. **Metadata** (createdAt, updatedAt)

### Example Document
```json
{
  "id": "subject_math101",
  "name": "Mathematics",
  "createdAt": "2025-12-01T08:00:00Z",
  "updatedAt": "2025-12-01T08:00:00Z"
}
```

---

## Attendance Collection

### Document Structure
```typescript
{
  // ========== IDENTIFIERS ==========
  id: string;                    // Auto-generated document ID
  
  // ========== REFERENCES ==========
  studentId: string;             // Reference to student document ID
  subjectId: string;             // Reference to subject document ID
  teacherId: string;             // Reference to teacher document ID
  sectionId: string;             // Reference to section document ID
  
  // ========== ATTENDANCE DETAILS ==========
  timestamp: number;              // Unix timestamp (milliseconds)
  period: number;                // Period number (1-8)
  present: boolean;               // Attendance status (true = present, false = absent)
  topic: string;                 // Optional: Topic covered in class
  
  // ========== METADATA ==========
  createdAt: Timestamp;          // Document creation timestamp
}
```

### ⚠️ Important: DO NOT Store Images in Attendance Records
- **Never store base64 images** directly in Firestore documents
- **Never store image URLs** in attendance records (not needed)
- If you need to store attendance photos, use Firebase Storage and store only the URL
- Base64 images bloat documents, increase costs, and slow down queries

### Field Organization (Recommended Order)
1. **Identifiers** (id)
2. **References** (studentId, subjectId, teacherId, sectionId)
3. **Attendance Details** (timestamp, period, present, topic)
4. **Metadata** (createdAt)

### Example Document
```json
{
  "id": "attendance_123456",
  "studentId": "1Lz3UibnQXvOPgSk9fYb",
  "subjectId": "subject_math101",
  "teacherId": "teacher_xyz789",
  "sectionId": "section_abc123",
  "timestamp": 1702435200000,
  "period": 1,
  "present": true,
  "topic": "Linear Algebra Basics",
  "createdAt": "2025-12-13T10:00:00Z"
}
```

---

## Face Data Collection

### Document Structure
```typescript
{
  // ========== IDENTIFIERS ==========
  studentId: string;             // Document ID = studentId (for direct lookup)
  
  // ========== FACE RECOGNITION DATA ==========
  descriptors: Record<string, number[]>;  // Face descriptors (desc_0, desc_1, ...)
  descriptorCount: number;       // Number of descriptors stored
  descriptorFormat: "object";    // Format identifier
  
  // ========== IMAGE STORAGE ==========
  imageURLs: string[];           // Array of Firebase Storage URLs
  sampleCount: number;           // Number of face samples/images
  
  // ========== METADATA ==========
  createdAt: Timestamp;         // Document creation timestamp
  updatedAt: Timestamp;          // Last update timestamp
}
```

### Field Organization (Recommended Order)
1. **Identifiers** (studentId)
2. **Face Recognition Data** (descriptors, descriptorCount, descriptorFormat)
3. **Image Storage** (imageURLs, sampleCount)
4. **Metadata** (createdAt, updatedAt)

### Example Document
```json
{
  "studentId": "1Lz3UibnQXvOPgSk9fYb",
  "descriptors": {
    "desc_0": [0.123, 0.456, ...],  // 128 numbers
    "desc_1": [0.789, 0.012, ...],  // 128 numbers
    // ... up to desc_99
  },
  "descriptorCount": 100,
  "descriptorFormat": "object",
  "imageURLs": [
    "https://storage.googleapis.com/.../face-images/.../image_0_1234567890.jpg",
    "https://storage.googleapis.com/.../face-images/.../image_1_1234567891.jpg"
  ],
  "sampleCount": 100,
  "createdAt": "2025-12-13T02:00:00Z",
  "updatedAt": "2025-12-13T02:15:00Z"
}
```

---

## Audit Logs Collection

### Document Structure
```typescript
{
  // ========== IDENTIFIERS ==========
  id: string;                    // Auto-generated document ID
  
  // ========== ACTOR INFORMATION ==========
  actorId: string;               // ID of user performing action
  actorRole: "student" | "teacher";  // Role of actor
  
  // ========== ACTION DETAILS ==========
  action: string;                // Action type (e.g., "add_attendance", "update_student")
  target: string;                 // Target entity ID (optional)
  details: Record<string, unknown>;  // Additional action details
  
  // ========== METADATA ==========
  timestamp: number;              // Unix timestamp (milliseconds)
  createdAt: Timestamp;          // Document creation timestamp
}
```

### Field Organization (Recommended Order)
1. **Identifiers** (id)
2. **Actor Info** (actorId, actorRole)
3. **Action Details** (action, target, details)
4. **Metadata** (timestamp, createdAt)

### Example Document
```json
{
  "id": "audit_789012",
  "actorId": "teacher_xyz789",
  "actorRole": "teacher",
  "action": "add_attendance",
  "target": "1Lz3UibnQXvOPgSk9fYb",
  "details": {
    "subjectId": "subject_math101",
    "sectionId": "section_abc123",
    "period": 1,
    "present": true
  },
  "timestamp": 1702435200000,
  "createdAt": "2025-12-13T10:00:00Z"
}
```

---

## Field Organization Best Practices

### 1. **Group Related Fields Together**
- ✅ Group identifiers at the top
- ✅ Group personal information together
- ✅ Group academic information together
- ✅ Group metadata at the bottom

### 2. **Use Consistent Naming Conventions**
- ✅ Use `camelCase` for field names
- ✅ Use descriptive names (e.g., `guardianPhone` not `gPhone`)
- ✅ Use consistent suffixes (e.g., `*Id` for references, `*At` for timestamps)

### 3. **Handle Empty/Null Values**
- ✅ Use empty strings `""` for optional text fields
- ✅ Use `false` for boolean defaults
- ✅ Use empty arrays `[]` for optional arrays
- ✅ Don't store `null` or `undefined` - omit the field instead

### 4. **Timestamp Management**
- ✅ Use Firestore `Timestamp` for `createdAt` and `updatedAt`
- ✅ Use Unix timestamp (number) for `timestamp` in attendance records
- ✅ Always update `updatedAt` when modifying documents

### 5. **Reference Management**
- ✅ Store document IDs (not full objects) for references
- ✅ Use consistent naming: `*Id` for single references, `*Ids` for arrays
- ✅ Keep references in sync (e.g., when deleting a section, update all students)

---

## Indexing Recommendations

### Composite Indexes (Create in Firestore Console)

#### 1. Attendance Queries
```javascript
// For: Get attendance by student and subject
Collection: attendance
Fields: studentId (Ascending), subjectId (Ascending), timestamp (Descending)

// For: Get attendance by section and subject
Collection: attendance
Fields: sectionId (Ascending), subjectId (Ascending), timestamp (Descending)

// For: Get attendance by section
Collection: attendance
Fields: sectionId (Ascending), timestamp (Descending)
```

#### 2. Student Queries
```javascript
// For: Get students by section
Collection: students
Fields: sectionId (Ascending), rollNumber (Ascending)

// For: Find student by roll number (already has single-field index)
Collection: students
Fields: rollNumber (Ascending)
```

#### 3. Teacher Queries
```javascript
// For: Find teacher by email
Collection: teachers
Fields: email (Ascending)

// For: Find teacher by employee ID
Collection: teachers
Fields: employeeId (Ascending)
```

---

## Data Migration Guide (Optional)

If you want to reorganize existing data, you can create a migration script. **Note: This is optional and should be done carefully with backups.**

### Migration Checklist
1. ✅ **Backup your database** before any migration
2. ✅ **Test migration on a small subset** first
3. ✅ **Update field order** in existing documents
4. ✅ **Clean up empty/null values**
5. ✅ **Verify data integrity** after migration
6. ✅ **Update application code** if field names change

### Example Migration Script (Node.js)
```javascript
// This is a template - customize based on your needs
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateStudents() {
  const studentsRef = db.collection('students');
  const snapshot = await studentsRef.get();
  
  const batch = db.batch();
  let count = 0;
  
  snapshot.forEach(doc => {
    const data = doc.data();
    
    // Reorganize fields in recommended order
    const reorganized = {
      // Identifiers
      id: doc.id,
      rollNumber: data.rollNumber || '',
      role: 'student',
      
      // Personal Info
      name: data.name || '',
      email: data.email || '',
      department: data.department || '',
      
      // Academic Info
      sectionId: data.sectionId || '',
      faceRegistered: data.faceRegistered || false,
      
      // Contact Info
      guardianPhone: data.guardianPhone || '',
      alternatePhone: data.alternatePhone || '',
      
      // Consent
      consentFaceData: data.consentFaceData || false,
      consentParentNotify: data.consentParentNotify || false,
      
      // Authentication
      password: data.password || '',
      
      // Metadata
      createdAt: data.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    batch.set(doc.ref, reorganized);
    count++;
    
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`Migrated ${count} students...`);
    }
  });
  
  if (count % 500 !== 0) {
    await batch.commit();
  }
  
  console.log(`✅ Migration complete: ${count} students`);
}

// Run migration
migrateStudents().catch(console.error);
```

---

## Summary

### ✅ Clean Structure Benefits
1. **Easy to Navigate** - Related fields grouped together
2. **Consistent Format** - Same field order across documents
3. **Better Performance** - Proper indexing for queries
4. **Maintainable** - Clear organization for future developers
5. **Scalable** - Structure supports growth

### 📝 Next Steps
1. Review this structure guide
2. Create composite indexes in Firestore Console
3. Optionally run migration script (with backups!)
4. Update documentation as needed
5. Train team on new structure

---

**Note:** This structure guide does NOT modify your application code. Your existing code will continue to work with the current database structure. This guide is for organizing and cleaning up your database for better maintainability and presentation to judges.

