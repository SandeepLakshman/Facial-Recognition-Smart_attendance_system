@echo off
REM SmartAttend AI - GitHub Setup Script for Windows
echo 🚀 Setting up SmartAttend AI for GitHub Pages deployment...

REM Check if git is initialized
if not exist ".git" (
    echo 📦 Initializing Git repository...
    git init
)

REM Add all files
echo 📁 Adding files to Git...
git add .

REM Create initial commit
echo 💾 Creating initial commit...
git commit -m "Initial commit: SmartAttend AI Facial Recognition Attendance System

- Complete React + TypeScript attendance management system
- Dual face recognition: Face API.js + OpenCV integration
- Real-time student detection and attendance tracking
- Role-based dashboards for students and teachers
- Modern UI with Tailwind CSS and shadcn/ui components
- Local data storage with comprehensive analytics
- Export functionality and attendance reports
- Responsive design with dark/light theme support
- Optimized for GitHub Pages deployment"

REM Build for GitHub Pages
echo 🔨 Building for GitHub Pages...
npm run build:github

echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Create a new repository on GitHub named 'smartattend-ai'
echo 2. Run: git remote add origin https://github.com/YOUR_USERNAME/smartattend-ai.git
echo 3. Run: git push -u origin main
echo 4. Go to repository Settings ^> Pages ^> Source: GitHub Actions
echo 5. Your site will be available at: https://YOUR_USERNAME.github.io/smartattend-ai/
echo.
echo 🎉 Happy coding!
pause
