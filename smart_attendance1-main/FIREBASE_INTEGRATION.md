# Firebase Integration Documentation

## Overview
The Smart Attendance System has been fully integrated with Firebase Firestore and Firebase Storage. All data operations now use Firebase instead of localStorage, providing a cloud-based, scalable solution.

## Firebase Project Configuration
- **Project Name**: cloud-attendance-system-26aca
- **Project ID**: cloud-attendance-system-26aca
- **Storage Bucket**: cloud-attendance-system-26aca.firebasestorage.app

## Firestore Database Structure

### Collections

#### 1. **students** Collection
Stores all student information:
```typescript
{
  id: string;
  role: "student";
  name: string;
  email: string;
  rollNumber: string;
  sectionId: string;
  faceRegistered: boolean;
  guardianPhone?: string;
  alternatePhone?: string;
  consentFaceData?: boolean;
  consentParentNotify?: boolean;
  department?: string;
  password?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 2. **teachers** Collection
Stores all teacher information:
```typescript
{
  id: string;
  role: "teacher";
  name: string;
  email: string;
  employeeId: string;
  sectionIds: string[];
  department?: string;
  phone?: string;
  password?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 3. **sections** Collection
Stores section/class information:
```typescript
{
  id: string;
  name: string;
  subjectIds: string[];
  teacherIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 4. **subjects** Collection
Stores subject/course information:
```typescript
{
  id: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 5. **attendance** Collection
Stores attendance records:
```typescript
{
  id: string;
  studentId: string;
  subjectId: string;
  teacherId: string;
  sectionId: string;
  timestamp: number;
  period: number;
  topic?: string;
  present: boolean;
  createdAt: Timestamp;
}
```

#### 6. **faceData** Collection
Stores face recognition data:
```typescript
{
  studentId: string;
  imageURLs: string[];  // URLs of face images in Firebase Storage
  faceFeatures: number[][];  // Extracted face features
  sampleCount: number;
  updatedAt: Timestamp;
  createdAt: Timestamp;
}
```

#### 7. **audits** Collection
Stores audit logs for system actions:
```typescript
{
  id: string;
  actorId: string;
  actorRole: "student" | "teacher";
  action: string;
  target?: string;
  timestamp: number;
  details?: Record<string, unknown>;
  createdAt: Timestamp;
}
```

#### 8. **topics** Collection
Stores topic/lesson logs:
```typescript
{
  id: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  period: number;
  timestamp: number;
  title: string;
  resources?: string;
  homework?: string;
  createdAt: Timestamp;
}
```

## Firebase Storage Structure

### Face Images Storage
Face images are stored in Firebase Storage with the following path structure:
```
face-images/
  └── {studentId}/
      ├── image_0_{timestamp}.jpg
      ├── image_1_{timestamp}.jpg
      └── ...
```

Each image includes metadata:
- `studentId`: The student's unique ID
- `imageIndex`: The index of the image in the capture sequence
- `uploadedAt`: ISO timestamp of upload

## Key Features

### 1. **Organized Data Structure**
- All collections are logically organized
- Timestamps track creation and updates
- Relationships maintained through IDs

### 2. **Face Image Storage**
- Face images are uploaded to Firebase Storage during registration
- Image URLs are stored in Firestore for quick access
- Face features are stored for recognition

### 3. **Real-time Updates**
- Real-time subscriptions available for students and attendance
- Automatic synchronization across devices

### 4. **Scalability**
- Cloud-based storage supports unlimited data
- Fast queries with Firestore indexing
- Secure access control

## Service Layer Architecture

### Firebase Service (`firebaseService.ts`)
All Firebase operations are centralized in the service layer:
- **Student Operations**: Create, read, update, delete students
- **Teacher Operations**: Manage teacher data
- **Section/Subject Operations**: Manage academic structure
- **Attendance Operations**: Record and retrieve attendance
- **Face Data Operations**: Store and retrieve face recognition data
- **Storage Operations**: Upload and manage face images

### Store Layer (`store.ts`)
The store layer provides a clean interface that:
- Maintains backward compatibility
- Handles async operations
- Provides error handling
- Abstracts Firebase complexity

## Migration from localStorage

All localStorage operations have been replaced with Firebase:
- ✅ Student data storage
- ✅ Teacher data storage
- ✅ Section and subject management
- ✅ Attendance records
- ✅ Face image storage
- ✅ Session management

## Security Considerations

1. **Firestore Security Rules**: Should be configured to:
   - Allow authenticated users only
   - Restrict access based on user roles
   - Validate data structure

2. **Storage Security Rules**: Should be configured to:
   - Restrict access to face images
   - Allow uploads only from authenticated users
   - Validate file types and sizes

## Performance Optimizations

1. **Indexed Queries**: All queries use indexed fields
2. **Batch Operations**: Multiple operations batched when possible
3. **Lazy Loading**: Data loaded on demand
4. **Caching**: Session data cached in localStorage for quick access

## Error Handling

All Firebase operations include:
- Try-catch blocks for error handling
- User-friendly error messages
- Console logging for debugging
- Graceful fallbacks where appropriate

## Testing Checklist

- [ ] Student registration and login
- [ ] Face capture and image upload
- [ ] Attendance marking
- [ ] Data retrieval and display
- [ ] Real-time updates
- [ ] Error scenarios

## Future Enhancements

1. **Firebase Authentication**: Replace password-based auth with Firebase Auth
2. **Cloud Functions**: Add server-side processing
3. **Analytics**: Integrate Firebase Analytics
4. **Push Notifications**: Use Firebase Cloud Messaging
5. **Offline Support**: Implement Firestore offline persistence

## Support

For issues or questions about Firebase integration:
1. Check Firebase Console for errors
2. Review browser console for client-side errors
3. Verify Firestore Security Rules
4. Check Storage Rules configuration

