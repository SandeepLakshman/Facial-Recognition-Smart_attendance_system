#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing SmartAttend AI Build...\n');

// Check if dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ dist/ directory not found. Run "npm run build:github" first.');
  process.exit(1);
}

// Check for essential files
const essentialFiles = [
  'index.html',
  'assets/index-C-5mVU8H.css',
  'assets/vendor-as1jXmYZ.js',
  'assets/index-BE3egYOr.js'
];

let allFilesExist = true;

console.log('📁 Checking essential files:');
essentialFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check for models directory
const modelsDir = path.join(distDir, 'models');
if (fs.existsSync(modelsDir)) {
  console.log('✅ models/ directory exists');
} else {
  console.log('❌ models/ directory missing');
  allFilesExist = false;
}

// Check for OpenCV files
const opencvFiles = [
  'haarcascade_frontalface_default.xml'
];

console.log('\n🔍 Checking OpenCV files:');
opencvFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check index.html for correct base path
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  const content = fs.readFileSync(indexPath, 'utf8');
  if (content.includes('/smartattend-ai/')) {
    console.log('✅ index.html has correct base path');
  } else {
    console.log('❌ index.html missing base path');
    allFilesExist = false;
  }
}

console.log('\n📊 Build Summary:');
if (allFilesExist) {
  console.log('🎉 All tests passed! Build is ready for GitHub Pages deployment.');
  console.log('\n📋 Next steps:');
  console.log('1. Push to GitHub repository');
  console.log('2. Enable GitHub Pages in repository settings');
  console.log('3. Your site will be live at: https://YOUR_USERNAME.github.io/smartattend-ai/');
} else {
  console.log('❌ Some tests failed. Please check the build process.');
  process.exit(1);
}
