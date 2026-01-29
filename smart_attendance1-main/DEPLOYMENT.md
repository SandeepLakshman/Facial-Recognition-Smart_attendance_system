# SmartAttend AI - Deployment Guide

## 🚀 GitHub Pages Deployment

This guide will help you deploy SmartAttend AI to GitHub Pages for free hosting.

### Prerequisites
- GitHub account
- Git installed on your computer
- Node.js 18+ installed

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `smartattend-ai` (or any name you prefer)
3. Make it public (required for free GitHub Pages)
4. Don't initialize with README (we already have one)

### Step 2: Push Your Code

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/smartattend-ai.git

# Push your code
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. Save the settings

### Step 4: Automatic Deployment

The repository includes a GitHub Actions workflow that will automatically:
- Build your project when you push to main branch
- Deploy to GitHub Pages
- Update your live site

### Step 5: Access Your Live Site

Your site will be available at:
```
https://YOUR_USERNAME.github.io/smartattend-ai/
```

## 🔧 Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Install dependencies
npm install

# Build for GitHub Pages
npm run build:github

# Deploy using gh-pages
npm run deploy
```

## 📁 Project Structure for Hosting

```
smartattend-ai/
├── .github/workflows/     # GitHub Actions
├── public/                # Static assets
│   ├── models/           # AI models
│   └── haarcascade_*.xml # OpenCV files
├── src/                  # Source code
├── dist/                 # Built files (auto-generated)
└── package.json          # Dependencies
```

## 🎯 Features Included

- ✅ **AI Face Recognition**: Face API.js + OpenCV
- ✅ **Real-time Detection**: Live camera feed
- ✅ **Student Management**: Registration and tracking
- ✅ **Teacher Dashboard**: Attendance management
- ✅ **Export Functionality**: CSV reports
- ✅ **Responsive Design**: Mobile-friendly
- ✅ **Dark/Light Theme**: User preference

## 🔒 Security & Privacy

- **Client-side Only**: No server required
- **Local Storage**: All data stored in browser
- **No External APIs**: Complete privacy
- **HTTPS Ready**: Secure by default on GitHub Pages

## 🚀 Performance Optimizations

- **Code Splitting**: Separate chunks for better loading
- **Asset Optimization**: Compressed images and files
- **Lazy Loading**: Components load as needed
- **Caching**: Browser-friendly caching headers

## 🛠️ Troubleshooting

### Common Issues

1. **Models Not Loading**
   - Check if models are in `/public/models/` directory
   - Ensure GitHub Pages serves static files correctly

2. **Camera Not Working**
   - Requires HTTPS (GitHub Pages provides this)
   - User must allow camera permissions

3. **Build Fails**
   - Check Node.js version (18+ required)
   - Run `npm install` to ensure dependencies

### Debug Commands

```bash
# Test build locally
npm run build:github
npm run preview:github

# Check for errors
npm run lint

# Development mode
npm run dev
```

## 📞 Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Verify all files are committed
3. Ensure repository is public
4. Check browser console for errors

## 🎉 Success!

Once deployed, your SmartAttend AI system will be live and accessible worldwide!

**Live Demo**: https://YOUR_USERNAME.github.io/smartattend-ai/
