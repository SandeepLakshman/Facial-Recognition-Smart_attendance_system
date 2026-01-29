# SmartAttend - AI Facial Recognition Attendance System

A modern, AI-powered attendance management system built with React, TypeScript, and advanced computer vision technologies. SmartAttend automates student attendance tracking using facial recognition, providing real-time analytics and seamless user experience.

## 🚀 Features

### Core Functionality
- **AI Face Recognition**: Advanced facial recognition using Face API.js and OpenCV
- **Real-time Detection**: Live camera feed with instant student identification
- **Dual Recognition Systems**: Both Face API.js and OpenCV-based detection
- **Automated Attendance**: Mark attendance automatically when students are detected
- **Manual Controls**: Start/stop detection and manual student detection

### User Management
- **Role-based Access**: Separate dashboards for students and teachers
- **Student Registration**: Easy student enrollment with face registration
- **Teacher Management**: Comprehensive teacher dashboard with section management
- **Authentication**: Secure login system for both students and teachers

### Analytics & Reporting
- **Real-time Statistics**: Live attendance counts and detection status
- **Attendance History**: Complete attendance records for each student
- **Export Functionality**: CSV export for attendance reports
- **Visual Analytics**: Charts and graphs for attendance trends

### Technical Features
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Live data synchronization and updates
- **Debug Tools**: Comprehensive logging and debugging information

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions

### UI Components
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Beautiful, customizable icons
- **React Router** - Client-side routing
- **React Hook Form** - Form handling and validation

### AI & Computer Vision
- **Face API.js** - JavaScript face recognition library
- **OpenCV.js** - Computer vision library for face detection
- **Haar Cascades** - Face detection algorithms

### State Management
- **React Query** - Server state management
- **Local Storage** - Client-side data persistence
- **Context API** - Global state management

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with camera access

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smartattend-ai.git
   cd smartattend-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:8080`

## 🚀 Quick Start

### For Students
1. Click "Register" on the landing page
2. Select "Student Sign Up"
3. Fill in your details and create account
4. Register your face for attendance
5. View your attendance history

### For Teachers
1. Click "Register" on the landing page
2. Select "Teacher Sign Up"
3. Create your teacher account
4. Set up sections and subjects
5. Start attendance sessions

### Starting an Attendance Session
1. Login as a teacher
2. Navigate to "Live Attendance Session"
3. Click "Start Detection" to begin
4. Students will be automatically detected and marked present
5. Use "Detect Now" for manual detection
6. Export attendance data when done

## 🔧 Configuration

### Face Recognition Models
The system uses pre-trained models for face recognition:
- Tiny Face Detector
- Face Landmark Detection
- Face Recognition Network
- Face Expression Recognition

Models are automatically loaded from `/public/models/` directory.

### OpenCV Configuration
Haar cascade files for face detection are located in `/public/` directory:
- `haarcascade_frontalface_default.xml`

## 📁 Project Structure

```
smartattend-ai/
├── public/
│   ├── models/                 # Face recognition models
│   ├── haarcascade_frontalface_default.xml
│   └── favicon.ico
├── src/
│   ├── components/             # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── charts/            # Data visualization
│   │   ├── gamification/      # Engagement features
│   │   └── notifications/     # User notifications
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── faceRecognition.ts # Face API.js integration
│   │   ├── opencvFaceRecognition.ts # OpenCV integration
│   │   └── store.ts           # Data management
│   ├── pages/                 # Page components
│   └── main.tsx              # Application entry point
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

## 🎯 Usage Examples

### Basic Attendance Session
```typescript
// Start detection
setIsScanning(true);

// Manual student detection
const detectStudent = () => {
  const student = getRandomStudent();
  onStudentDetected(student);
};
```

### Face Registration
```typescript
// Register student face
const registerFace = async (studentId: string, image: HTMLCanvasElement) => {
  const success = await registerStudentFace(studentId, image);
  return success;
};
```

## 🔒 Security & Privacy

- **Local Data Storage**: All data stored locally in browser
- **No External APIs**: Face recognition runs entirely client-side
- **Privacy First**: No data sent to external servers
- **Secure Authentication**: Role-based access control

## 🚀 Deployment

### GitHub Pages (Recommended)

1. **Quick Setup**:
   ```bash
   # Windows
   setup-github.bat
   
   # Linux/Mac
   chmod +x setup-github.sh
   ./setup-github.sh
   ```

2. **Manual Setup**:
   ```bash
   # Build for GitHub Pages
   npm run build:github
   
   # Deploy
   npm run deploy
   ```

3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - Your site: `https://YOUR_USERNAME.github.io/smartattend-ai/`

### Other Hosting Options
- **Vercel**: `vercel --prod`
- **Netlify**: Drag `dist/` folder to Netlify
- **AWS S3**: Upload `dist/` contents to S3 bucket

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Face API.js](https://github.com/justadudewhohacks/face-api.js) for facial recognition
- [OpenCV.js](https://opencv.org/) for computer vision
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

For support, email support@smartattend.com or create an issue on GitHub.

---

**SmartAttend** - Making attendance tracking smarter, faster, and more accurate with AI.