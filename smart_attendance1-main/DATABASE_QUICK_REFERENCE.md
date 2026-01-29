# Firestore Database Quick Reference
## Clean Structure at a Glance

---

## 📊 Collection Overview

```
Firestore Database
├── students          (Student profiles)
├── teachers          (Teacher profiles)
├── sections          (Class sections)
├── subjects          (Course subjects)
├── attendance        (Attendance records)
├── faceData          (Face recognition data)
└── audits            (Audit logs)
```

---

## 🎯 Field Organization Pattern

### Standard Field Order (Apply to All Collections)

```
1. IDENTIFIERS
   ├── id
   ├── [uniqueIdentifier] (rollNumber, employeeId, etc.)
   └── role (if applicable)

2. PERSONAL/MAIN INFO
   ├── name
   ├── email
   └── [other personal fields]

3. ACADEMIC/RELATIONAL INFO
   ├── sectionId / sectionIds
   ├── subjectId / subjectIds
   └── [other relational fields]

4. SPECIFIC DATA
   └── [collection-specific fields]

5. METADATA
   ├── createdAt
   └── updatedAt
```

---

## 📝 Students Collection

```
students/{studentId}
├── id: string
├── rollNumber: string          ⭐ Unique
├── role: "student"
├── name: string
├── email: string
├── department: string
├── sectionId: string
├── faceRegistered: boolean
├── guardianPhone: string
├── alternatePhone: string
├── consentFaceData: boolean
├── consentParentNotify: boolean
├── password: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

**Indexes Needed:**
- `rollNumber` (single field)
- `sectionId` (single field)
- `sectionId + rollNumber` (composite)

---

## 👨‍🏫 Teachers Collection

```
teachers/{teacherId}
├── id: string
├── employeeId: string          ⭐ Unique
├── role: "teacher"
├── name: string
├── email: string
├── department: string
├── phone: string
├── sectionIds: string[]
├── password: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

**Indexes Needed:**
- `employeeId` (single field)
- `email` (single field)

---

## 📚 Sections Collection

```
sections/{sectionId}
├── id: string
├── name: string                ⭐ Unique
├── subjectIds: string[]
├── teacherIds: string[]
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

**Indexes Needed:**
- `name` (single field)

---

## 📖 Subjects Collection

```
subjects/{subjectId}
├── id: string
├── name: string
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

**Indexes Needed:**
- None (small collection, simple queries)

---

## ✅ Attendance Collection

```
attendance/{attendanceId}
├── id: string
├── studentId: string           🔗 Reference
├── subjectId: string           🔗 Reference
├── teacherId: string            🔗 Reference
├── sectionId: string           🔗 Reference
├── timestamp: number            ⏰ Unix timestamp (ms)
├── period: number               (1-8)
├── present: boolean
├── topic: string                (optional)
└── createdAt: Timestamp
```

**⚠️ DO NOT store:**
- ❌ `image` (base64) - Use Firebase Storage instead
- ❌ Large binary data - Use Firebase Storage

**Indexes Needed:**
- `studentId + subjectId + timestamp` (composite)
- `sectionId + subjectId + timestamp` (composite)
- `sectionId + timestamp` (composite)
- `studentId + timestamp` (composite)

---

## 👤 Face Data Collection

```
faceData/{studentId}             ⭐ Document ID = studentId
├── studentId: string
├── descriptors: object          {desc_0: [...], desc_1: [...], ...}
├── descriptorCount: number
├── descriptorFormat: "object"
├── imageURLs: string[]
├── sampleCount: number
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

**Indexes Needed:**
- None (direct lookup by studentId)

---

## 📋 Audit Logs Collection

```
audits/{auditId}
├── id: string
├── actorId: string
├── actorRole: "student" | "teacher"
├── action: string
├── target: string               (optional)
├── details: object               (optional)
├── timestamp: number            ⏰ Unix timestamp (ms)
└── createdAt: Timestamp
```

**Indexes Needed:**
- `actorId + timestamp` (composite)
- `action + timestamp` (composite)

---

## 🎨 Visual Field Organization

### Students Document Example
```
┌─────────────────────────────────────┐
│ IDENTIFIERS                          │
│ ├─ id: "1Lz3UibnQXvOPgSk9fYb"      │
│ ├─ rollNumber: "27eg1"              │
│ └─ role: "student"                  │
├─────────────────────────────────────┤
│ PERSONAL INFORMATION                │
│ ├─ name: "Sandeep"                  │
│ ├─ email: "sandeep@example.com"    │
│ └─ department: "CSE"                │
├─────────────────────────────────────┤
│ ACADEMIC INFORMATION                │
│ ├─ sectionId: "section_abc123"      │
│ └─ faceRegistered: true             │
├─────────────────────────────────────┤
│ CONTACT INFORMATION                  │
│ ├─ guardianPhone: "8731888971"     │
│ └─ alternatePhone: ""              │
├─────────────────────────────────────┤
│ CONSENT & PRIVACY                    │
│ ├─ consentFaceData: true            │
│ └─ consentParentNotify: true        │
├─────────────────────────────────────┤
│ AUTHENTICATION                       │
│ └─ password: "hashed_password"     │
├─────────────────────────────────────┤
│ METADATA                             │
│ ├─ createdAt: Timestamp             │
│ └─ updatedAt: Timestamp             │
└─────────────────────────────────────┘
```

---

## 🔍 Query Patterns

### Common Queries

```javascript
// Get student by roll number
students.where('rollNumber', '==', '27eg1')

// Get all students in a section
students.where('sectionId', '==', 'section_abc123')

// Get attendance for a student
attendance.where('studentId', '==', 'studentId')
          .orderBy('timestamp', 'desc')

// Get attendance for a section and subject
attendance.where('sectionId', '==', 'sectionId')
          .where('subjectId', '==', 'subjectId')
          .orderBy('timestamp', 'desc')

// Get teacher by employee ID
teachers.where('employeeId', '==', 'TECH001')
```

---

## ✅ Cleanup Checklist

### For Each Document:
- [ ] Fields organized in recommended order
- [ ] Empty strings instead of null/undefined
- [ ] Consistent naming (camelCase)
- [ ] Timestamps properly formatted
- [ ] References use document IDs (not full objects)
- [ ] No duplicate or redundant fields

### For Each Collection:
- [ ] Proper indexes created
- [ ] Document IDs are meaningful or auto-generated
- [ ] Field names are descriptive
- [ ] No deprecated fields

---

## 🚀 Quick Tips

1. **Always update `updatedAt`** when modifying documents
2. **Use empty strings `""`** for optional text fields (not null)
3. **Use `false`** for boolean defaults (not null/undefined)
4. **Store references as IDs** (not full objects)
5. **Group related fields together** for readability
6. **Create composite indexes** before deploying queries
7. **Use consistent naming** across all collections

---

## 📞 Need Help?

Refer to the full guide: `FIRESTORE_DATABASE_STRUCTURE.md`

