# Smart Attendance - AI Face Recognition System 🚀

A premium, real-time attendance management system that uses **Artificial Intelligence** to identify students and **Cloud Syncing** to update records instantly. Built for modern educational institutions and corporate environments.

![Student Dashboard](C:/Users/sande/.gemini/antigravity/brain/ae3f476e-a734-4612-aafa-29388b793eb3/uploaded_media_1769718630627.png)

## 🌟 Key Features

### 1. AI-Powered Face ID
- **One-Time Registration**: Students capture their face during onboarding using advanced **Face-api.js** technology.
- **Biometric Security**: Converts facial features into unique numerical descriptors—no raw images are stored, ensuring 100% privacy.
- **Deep Learning**: Uses 128-point vector matching for extreme accuracy, even with changes in lighting or accessories.

### 2. Teacher Kiosk Mode
- **Mass Scanning**: Teachers can scan a whole room in seconds using the "Live Scanner".
- **Dynamic Context**: Automatically loads student faces for the specific section (e.g., CSE-A) and subject.
- **Live Logs**: Real-time debug logs show detection status and student IDs as they are found.

![Teacher Kiosk](C:/Users/sande/.gemini/antigravity/brain/ae3f476e-a734-4612-aafa-29388b793eb3/uploaded_media_1769718386123.png)

### 3. Premium Real-Time Dashboard
- **Live Pulse Technology**: The student's dashboard updates **instantly** the moment the teacher scans them—no page refresh required.
- **Attendance Health**: Visual indicators (Green/Red) and percentage trackers show overall attendance performance at a glance.
- **Timeline Thread**: A chronological history of all classes attended, grouped by day and period.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS + Shadcn UI + Lucide Icons |
| **Database** | Firebase Firestore (NoSQL) |
| **Real-time** | Firestore Snapshots + Subscriptions |
| **AI Engine** | Face-api.js (TensorFlow.js) |
| **Animations** | Framer Motion |

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/your-username/smart-attendance.git
   cd smart-attendance
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_id
   ...
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to view the app!

---

## 🔄 How It Works (The Workflow)

1. **Register**: Students sign up and capture their face data. 📸
2. **Session**: Teacher starts a live session for a subject. 📝
3. **Scan**: Teacher uses the **Teacher Kiosk** to scan the room. 🔍
4. **Sync**: Cloud updates all student dashboards in real-time. ⚡

---

## 🎯 Vision
Our mission is to eliminate manual paperwork and attendance fraud by providing a transparent, fast, and automated experience for educational excellence.

---

## 📝 License
This project is licensed under the MIT License.

---
**Crafted with ❤️ for modern education.**