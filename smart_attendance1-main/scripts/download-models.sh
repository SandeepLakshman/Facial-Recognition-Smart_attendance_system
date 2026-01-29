#!/bin/bash

# Face Recognition Models Download Script
# This script downloads all required models for face-api.js and OpenCV

set -e

echo "=================================================="
echo "Face Recognition Models Download Script"
echo "=================================================="
echo ""

# Base URL for face-api.js models
BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

# Target directory for face-api.js models
MODELS_DIR="public/models"

# Create models directory if it doesn't exist
mkdir -p "$MODELS_DIR"

echo "📥 Downloading face-api.js models to $MODELS_DIR..."
echo ""

# Download Tiny Face Detector Model
echo "1/4 Downloading Tiny Face Detector Model..."
curl -L --progress-bar "$BASE_URL/tiny_face_detector_model-weights_manifest.json" -o "$MODELS_DIR/tiny_face_detector_model-weights_manifest.json"
curl -L --progress-bar "$BASE_URL/tiny_face_detector_model-shard1" -o "$MODELS_DIR/tiny_face_detector_model-shard1"

# Download Face Landmark 68 Model
echo "2/4 Downloading Face Landmark 68 Model..."
curl -L --progress-bar "$BASE_URL/face_landmark_68_model-weights_manifest.json" -o "$MODELS_DIR/face_landmark_68_model-weights_manifest.json"
curl -L --progress-bar "$BASE_URL/face_landmark_68_model-shard1" -o "$MODELS_DIR/face_landmark_68_model-shard1"

# Download Face Recognition Model
echo "3/4 Downloading Face Recognition Model..."
curl -L --progress-bar "$BASE_URL/face_recognition_model-weights_manifest.json" -o "$MODELS_DIR/face_recognition_model-weights_manifest.json"
curl -L --progress-bar "$BASE_URL/face_recognition_model-shard1" -o "$MODELS_DIR/face_recognition_model-shard1"

# Download Face Expression Model
echo "4/4 Downloading Face Expression Model..."
curl -L --progress-bar "$BASE_URL/face_expression_model-weights_manifest.json" -o "$MODELS_DIR/face_expression_model-weights_manifest.json"
curl -L --progress-bar "$BASE_URL/face_expression_model-shard1" -o "$MODELS_DIR/face_expression_model-shard1"

echo ""
echo "✅ Face-api.js models downloaded successfully!"
echo ""

# Download OpenCV Haar Cascade
echo "📥 Downloading OpenCV Haar Cascade for face detection..."
curl -L --progress-bar "https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml" -o "public/haarcascade_frontalface_default.xml"

echo ""
echo "✅ OpenCV Haar Cascade downloaded successfully!"
echo ""

# Verify downloads
echo "🔍 Verifying downloaded files..."
echo ""

REQUIRED_FILES=(
    "$MODELS_DIR/tiny_face_detector_model-weights_manifest.json"
    "$MODELS_DIR/tiny_face_detector_model-shard1"
    "$MODELS_DIR/face_landmark_68_model-weights_manifest.json"
    "$MODELS_DIR/face_landmark_68_model-shard1"
    "$MODELS_DIR/face_recognition_model-weights_manifest.json"
    "$MODELS_DIR/face_recognition_model-shard1"
    "$MODELS_DIR/face_expression_model-weights_manifest.json"
    "$MODELS_DIR/face_expression_model-shard1"
    "public/haarcascade_frontalface_default.xml"
)

ALL_PRESENT=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(du -h "$file" | cut -f1)
        echo "  ✓ $file ($SIZE)"
    else
        echo "  ✗ $file (MISSING)"
        ALL_PRESENT=false
    fi
done

echo ""

if [ "$ALL_PRESENT" = true ]; then
    echo "=================================================="
    echo "✅ All model files downloaded successfully!"
    echo "=================================================="
    echo ""
    echo "Total models size:"
    du -sh "$MODELS_DIR"
    echo ""
    echo "You can now run the application with:"
    echo "  npm run dev"
    echo ""
else
    echo "=================================================="
    echo "⚠️  Some files are missing. Please check errors above."
    echo "=================================================="
    exit 1
fi
