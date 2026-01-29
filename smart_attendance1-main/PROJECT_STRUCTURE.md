# SmartAttend - Project Structure

## 📁 Directory Overview

```
smartattend-ai/
├── 📁 public/                     # Static assets
│   ├── 📁 models/                 # Face recognition AI models
│   │   ├── face_expression_model-shard1
│   │   ├── face_expression_model-weights_manifest.json
│   │   ├── face_landmark_68_model-shard1
│   │   ├── face_landmark_68_model-weights_manifest.json
│   │   ├── face_recognition_model-shard1
│   │   ├── face_recognition_model-shard2
│   │   ├── face_recognition_model-weights_manifest.json
│   │   ├── tiny_face_detector_model-shard1
│   │   └── tiny_face_detector_model-weights_manifest.json
│   ├── haarcascade_frontalface_default.xml  # OpenCV face detection
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── placeholder.svg
│   ├── Learning-cuate.png
│   ├── student-learning.png
│   ├── Teacher.jpg
│   └── robots.txt
├── 📁 src/                        # Source code
│   ├── 📁 components/             # React components
│   │   ├── 📁 ui/                # Reusable UI components (49 files)
│   │   ├── 📁 charts/            # Data visualization components
│   │   │   └── AttendanceChart.tsx
│   │   ├── 📁 gamification/      # Engagement features
│   │   │   └── AttendanceStreak.tsx
│   │   ├── 📁 notifications/     # User notifications
│   │   │   └── AttendanceNotification.tsx
│   │   ├── 📁 backgrounds/       # Background components
│   │   │   ├── MouseReactiveBackground.tsx
│   │   │   └── ParallaxBackground.tsx
│   │   ├── 📁 theme/             # Theme management
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── AttendanceHistory.tsx
│   │   ├── AttendanceReports.tsx
│   │   ├── AttendanceSession.tsx
│   │   ├── FaceCapture.tsx
│   │   ├── FaceRecognitionSelector.tsx
│   │   ├── OpenCVAttendanceSession.tsx
│   │   ├── OpenCVAttendanceSystem.tsx
│   │   ├── OpenCVFaceCapture.tsx
│   │   ├── RoleSelection.tsx
│   │   ├── SimpleFaceDetection.tsx
│   │   ├── StudentDashboard.tsx
│   │   └── TeacherDashboard.tsx
│   ├── 📁 hooks/                 # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── 📁 lib/                   # Utility libraries
│   │   ├── faceRecognition.ts    # Face API.js integration
│   │   ├── opencvFaceRecognition.ts # OpenCV integration
│   │   ├── store.ts              # Data management & localStorage
│   │   └── utils.ts              # Utility functions
│   ├── 📁 pages/                 # Page components
│   │   ├── Index.tsx
│   │   ├── Landing.tsx
│   │   ├── NotFound.tsx
│   │   ├── SimpleDetection.tsx
│   │   ├── StudentAuth.tsx
│   │   └── TeacherAuth.tsx
│   ├── App.tsx                   # Main app component
│   ├── App.css                   # Global styles
│   ├── index.css                 # CSS imports
│   ├── main.tsx                  # Application entry point
│   └── vite-env.d.ts            # Vite type definitions
├── 📄 package.json               # Dependencies and scripts
├── 📄 package-lock.json          # Lock file
├── 📄 vite.config.ts             # Vite configuration
├── 📄 tailwind.config.ts         # Tailwind CSS configuration
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 tsconfig.app.json          # App-specific TypeScript config
├── 📄 tsconfig.node.json         # Node-specific TypeScript config
├── 📄 postcss.config.js          # PostCSS configuration
├── 📄 eslint.config.js           # ESLint configuration
├── 📄 components.json            # shadcn/ui configuration
├── 📄 index.html                 # HTML entry point
├── 📄 README.md                  # Project documentation
├── 📄 LICENSE                    # MIT License
├── 📄 .gitignore                 # Git ignore rules
└── 📄 PROJECT_STRUCTURE.md       # This file
```

## 🎯 Key Features by Directory

### `/src/components/`
- **UI Components**: Complete shadcn/ui component library
- **Attendance System**: Core attendance management components
- **Face Recognition**: Both Face API.js and OpenCV implementations
- **Dashboards**: Student and teacher specific interfaces
- **Charts & Analytics**: Data visualization components

### `/src/lib/`
- **faceRecognition.ts**: Face API.js integration with model loading
- **opencvFaceRecognition.ts**: OpenCV-based face detection and recognition
- **store.ts**: Complete data management system with localStorage
- **utils.ts**: Utility functions and helpers

### `/src/pages/`
- **Landing.tsx**: Marketing and registration page
- **StudentAuth.tsx**: Student login/signup
- **TeacherAuth.tsx**: Teacher login/signup
- **Index.tsx**: Main dashboard selector

### `/public/models/`
- **Face API Models**: Pre-trained models for facial recognition
- **Model Files**: Binary model files and manifests
- **Haar Cascade**: OpenCV face detection cascade

## 🚀 Getting Started

1. **Install Dependencies**: `npm install`
2. **Start Development**: `npm run dev`
3. **Build Production**: `npm run build`
4. **Preview Build**: `npm run preview`

## 🔧 Configuration Files

- **vite.config.ts**: Vite build tool configuration
- **tailwind.config.ts**: Tailwind CSS configuration
- **tsconfig.json**: TypeScript compiler options
- **eslint.config.js**: Code linting rules
- **components.json**: shadcn/ui component configuration

## 📦 Dependencies

### Core Framework
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)

### AI & Computer Vision
- face-api.js (facial recognition)
- opencv-ts (computer vision)

### UI & Components
- Radix UI (accessible components)
- Framer Motion (animations)
- Lucide React (icons)

### State Management
- React Query (server state)
- Local Storage (data persistence)

## 🎨 Design System

- **Colors**: Custom color palette with dark/light themes
- **Typography**: Inter font family
- **Components**: Consistent shadcn/ui component library
- **Animations**: Smooth Framer Motion transitions
- **Responsive**: Mobile-first design approach

## 🔒 Security & Privacy

- **Client-side Only**: No external API calls
- **Local Storage**: All data stored locally
- **Privacy First**: No data collection or tracking
- **Secure**: Role-based access control

---

This project is built from scratch using modern web technologies and best practices for a production-ready AI attendance system.
