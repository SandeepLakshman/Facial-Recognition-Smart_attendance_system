/**
 * Face Recognition Library
 * Real face detection and recognition using Face API
 */

// Import face-api from global scope since it's loaded via script tag
declare global {
  interface Window {
    faceapi: any;
  }
}

const faceapi = typeof window !== 'undefined' ? window.faceapi : null;

import {
  loadAllFaceDescriptors,
  loadFaceDescriptorsForSection,
  findStudentByRollNumber,
  getStudentFromFirebase,
  saveFaceDescriptors
} from "./firebaseService";

// Face recognition state
let isModelLoaded = false;
let faceDescriptors: Map<string, Float32Array[]> = new Map(); // studentId -> face descriptors

// Load face descriptors from Firebase
export const loadFaceDescriptorsFromFirebase = async (sectionId?: string): Promise<void> => {
  try {
    console.log('🔄 Loading face descriptors from Firebase...');
    // const { loadAllFaceDescriptors, loadFaceDescriptorsForSection } = await import("./firebaseService");

    let descriptorsMap;
    if (sectionId) {
      console.log(`🎯 Loading optimized descriptors for section: ${sectionId}`);
      descriptorsMap = await loadFaceDescriptorsForSection(sectionId);
    } else {
      console.log(`⚠️ No section provided, loading ALL descriptors (slower)`);
      descriptorsMap = await loadAllFaceDescriptors();
    }

    console.log(`📦 Received ${descriptorsMap.size} students from Firebase`);

    // Clear existing descriptors
    faceDescriptors.clear();

    // Convert number[][] to Float32Array[]
    for (const [rollNumber, descriptors] of descriptorsMap.entries()) {
      if (descriptors && descriptors.length > 0) {
        const float32Descriptors = descriptors.map(desc => {
          // Accept both FaceAPI (128) and OpenCV (100) descriptor lengths
          if (Array.isArray(desc) && (desc.length === 128 || desc.length === 100 || desc.length > 50)) {
            return new Float32Array(desc);
          }
          return null;
        }).filter((d): d is Float32Array => d !== null);

        if (float32Descriptors.length > 0) {
          faceDescriptors.set(rollNumber, float32Descriptors);
          console.log(`✅ Loaded ${float32Descriptors.length} descriptors for ${rollNumber}`);
        } else {
          console.warn(`⚠️ Invalid descriptors for ${rollNumber}`);
        }
      }
    }

    console.log(`✅ Loaded ${faceDescriptors.size} students' face descriptors from Firebase`);
    console.log(`📋 Registered students:`, Array.from(faceDescriptors.keys()));
  } catch (error) {
    console.error("❌ Error loading face descriptors from Firebase:", error);
  }
};

// Save face descriptors to Firebase
// studentIdOrRoll can be either student ID or rollNumber
export const saveFaceDescriptorsToFirebase = async (studentIdOrRoll: string): Promise<void> => {
  try {
    console.log(`🔄 Saving face descriptors for: ${studentIdOrRoll}`);
    console.log(`📋 Available keys in faceDescriptors:`, Array.from(faceDescriptors.keys()));

    // Get student first to find rollNumber
    // const { findStudentByRollNumber, getStudentFromFirebase } = await import("./firebaseService");
    let student = await findStudentByRollNumber(studentIdOrRoll);
    if (!student) {
      student = await getStudentFromFirebase(studentIdOrRoll);
    }

    if (!student) {
      throw new Error(`Student not found for ${studentIdOrRoll}`);
    }

    console.log(`✅ Found student: ${student.name} (Roll: ${student.rollNumber}, ID: ${student.id})`);

    // Get descriptors using rollNumber (this is how they're stored during capture)
    let descriptors = faceDescriptors.get(student.rollNumber);

    if (!descriptors || descriptors.length === 0) {
      // Try with the original key as fallback
      descriptors = faceDescriptors.get(studentIdOrRoll);
    }

    if (!descriptors || descriptors.length === 0) {
      console.error(`❌ No descriptors found in memory for ${student.rollNumber}`);
      console.error(`📋 Current faceDescriptors keys:`, Array.from(faceDescriptors.keys()));
      console.error(`📊 Total descriptors in map:`, faceDescriptors.size);
      throw new Error(`No face descriptors found. Please try capturing again.`);
    }

    console.log(`✅ Found ${descriptors.length} descriptors for ${student.rollNumber}`);

    // Convert Float32Array[] to number[][]
    const descriptorsArray = descriptors.map(desc => {
      if (desc instanceof Float32Array) {
        return Array.from(desc);
      }
      return desc;
    });

    console.log(`📦 Converting ${descriptorsArray.length} descriptors to array format...`);

    // Save to Firebase using student ID
    // const { saveFaceDescriptors } = await import("./firebaseService");
    await saveFaceDescriptors(student.id, descriptorsArray);

    console.log(`✅ Successfully saved ${descriptors.length} face descriptors to Firebase for student ${student.rollNumber} (ID: ${student.id})`);
  } catch (error: any) {
    console.error("❌ Error saving face descriptors to Firebase:", error);
    throw new Error(error?.message || "Failed to save face descriptors to Firebase");
  }
};

// Load Face API models with timeout
export const loadFaceModels = async (): Promise<boolean> => {
  try {
    if (isModelLoaded) return true;

    console.log('🔄 Starting to load face recognition models...');

    // Check if face-api is available
    if (typeof faceapi === 'undefined') {
      console.error('❌ Face API not loaded. Make sure the script is included in index.html');
      return false;
    }

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Model loading timeout after 30 seconds')), 30000);
    });

    // Load Face API models with timeout - try multiple paths
    // Use jsDelivr CDN which hosts the models
    const modelPaths = [
      'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights',
      'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights',
      '/models',
      '/node_modules/face-api.js/weights'
    ];

    let loaded = false;
    let lastError: any = null;

    for (const modelPath of modelPaths) {
      try {
        console.log(`🔄 Trying to load models from: ${modelPath}`);

        // Load models with individual error handling
        const loadPromises = [
          faceapi.nets.tinyFaceDetector.loadFromUri(modelPath).catch(e => {
            console.warn(`Failed to load tinyFaceDetector from ${modelPath}:`, e);
            throw e;
          }),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelPath).catch(e => {
            console.warn(`Failed to load faceLandmark68Net from ${modelPath}:`, e);
            throw e;
          }),
          faceapi.nets.faceRecognitionNet.loadFromUri(modelPath).catch(e => {
            console.warn(`Failed to load faceRecognitionNet from ${modelPath}:`, e);
            throw e;
          })
        ];

        await Promise.race([
          Promise.all(loadPromises),
          timeoutPromise
        ]);

        loaded = true;
        console.log(`✅ Models loaded successfully from ${modelPath}`);
        break;
      } catch (error) {
        lastError = error;
        console.warn(`❌ Failed to load from ${modelPath}:`, error);
        // Continue to next path
        continue;
      }
    }

    if (!loaded) {
      console.error('❌ Failed to load models from all paths. Last error:', lastError);
      throw new Error(`Failed to load models from all paths. Please ensure you have internet connection. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    isModelLoaded = true;
    console.log('✅ Face recognition models loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Error loading face models:', error);
    isModelLoaded = false;
    return false;
  }
};

// Detect faces in an image
export const detectFaces = async (imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.FaceDetection>>[]> => {
  if (!isModelLoaded) {
    await loadFaceModels();
  }

  try {
    // Use more sensitive options for better detection
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 512, // Higher resolution for better detection
      scoreThreshold: 0.3 // Lower threshold to detect more faces
    });

    const detections = await faceapi
      .detectAllFaces(imageElement, options)
      .withFaceLandmarks()
      .withFaceDescriptors();

    return detections;
  } catch (error) {
    console.error('❌ Error detecting faces:', error);
    return [];
  }
};

// Register a student's face
export const registerStudentFace = async (studentId: string, imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<boolean> => {
  try {
    const detections = await detectFaces(imageElement);

    if (detections.length === 0) {
      console.warn('⚠️ No faces detected in image');
      return false;
    }

    // Use the first detected face
    const faceDescriptor = detections[0].descriptor;

    // Store face descriptor for this student
    if (!faceDescriptors.has(studentId)) {
      faceDescriptors.set(studentId, []);
    }

    const studentDescriptors = faceDescriptors.get(studentId)!;
    studentDescriptors.push(faceDescriptor);

    console.log(`✅ Face registered for student ${studentId}`);
    return true;
  } catch (error) {
    console.error('❌ Error registering face:', error);
    return false;
  }
};

// Recognize faces in an image - returns detection with coordinates (including unrecognized faces)
export const recognizeFaces = async (imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<{ studentId: string; confidence: number; box: { x: number; y: number; width: number; height: number }; isRecognized: boolean }[]> => {
  try {
    const detections = await detectFaces(imageElement);
    console.log(`🔍 Detected ${detections.length} faces`);

    if (detections.length === 0) {
      console.log('⚠️ No faces detected in image');
      return [];
    }

    const recognitions: { studentId: string; confidence: number; box: { x: number; y: number; width: number; height: number }; isRecognized: boolean }[] = [];
    let registeredStudents = Array.from(faceDescriptors.keys());

    if (registeredStudents.length === 0) {
      console.warn('⚠️ No registered students found in memory. Attempting to load from Firebase...');

      // Auto-load descriptors if missing
      await loadFaceDescriptorsFromFirebase();

      // Re-check after loading
      if (faceDescriptors.size === 0) {
        console.warn('⚠️ Still no registered students found after loading. Returning unknown.');
        // Still return detected faces even if no students are registered
        return detections.map(detection => {
          const box = detection.detection.box;
          return {
            studentId: 'unknown',
            confidence: 0,
            box: {
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height
            },
            isRecognized: false
          };
        });
      }
      // Update registeredStudents after potential load
      registeredStudents = Array.from(faceDescriptors.keys());
    }

    console.log(`👥 Comparing against ${registeredStudents.length} registered students:`, registeredStudents);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3082e2ba-98d4-447b-a2b8-4c8eb0b91e8e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'faceRecognition.ts:283', message: 'Starting face recognition matching', data: { detectionsCount: detections.length, registeredStudentsCount: registeredStudents.length, totalDescriptors: Array.from(faceDescriptors.values()).reduce((sum, descs) => sum + descs.length, 0) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion

    const recognitionStartTime = Date.now();

    for (const detection of detections) {
      const faceDescriptor = detection.descriptor;
      let bestMatch: { studentId: string; confidence: number } | null = null;

      // #region agent log
      const comparisonStartTime = Date.now();
      // #endregion

      // Compare with all registered students
      // Optimize: break early if we find a very high confidence match (>0.8)
      for (const [studentId, descriptors] of faceDescriptors.entries()) {
        for (const descriptor of descriptors) {
          const distance = faceapi.euclideanDistance(faceDescriptor, descriptor);
          const confidence = Math.max(0, 1 - distance); // Convert distance to confidence (0-1)

          // Lower threshold to 0.4 for better recognition
          if (confidence > 0.4 && (!bestMatch || confidence > bestMatch.confidence)) {
            bestMatch = { studentId, confidence };
            // Early exit if confidence is very high (optimization)
            if (confidence > 0.8) {
              break;
            }
          }
        }
        // Early exit if we found a very high confidence match
        if (bestMatch && bestMatch.confidence > 0.8) {
          break;
        }
      }

      // #region agent log
      const comparisonTime = Date.now() - comparisonStartTime;
      fetch('http://127.0.0.1:7242/ingest/3082e2ba-98d4-447b-a2b8-4c8eb0b91e8e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'faceRecognition.ts:300', message: 'Face comparison completed', data: { comparisonTimeMs: comparisonTime, descriptorsCompared: Array.from(faceDescriptors.values()).reduce((sum, descs) => sum + descs.length, 0), bestMatchFound: bestMatch !== null }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion

      // Get face box coordinates
      const box = detection.detection.box;

      // Debug: Log raw coordinates from face-api
      if (detections.indexOf(detection) === 0) {
        console.log('🎯 Raw face detection box:', {
          x: box.x.toFixed(1),
          y: box.y.toFixed(1),
          width: box.width.toFixed(1),
          height: box.height.toFixed(1),
          timestamp: Date.now()
        });
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3082e2ba-98d4-447b-a2b8-4c8eb0b91e8e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'faceRecognition.ts:302', message: 'Face box coordinates from detection', data: { boxX: box.x, boxY: box.y, boxWidth: box.width, boxHeight: box.height, isRecognized: bestMatch !== null }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run2', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion

      if (bestMatch) {
        recognitions.push({
          studentId: bestMatch.studentId,
          confidence: bestMatch.confidence,
          box: {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height
          },
          isRecognized: true
        });
        console.log(`✅ Best match: ${bestMatch.studentId} with confidence ${bestMatch.confidence.toFixed(3)}`);
      } else {
        // Still return the face detection even if not recognized
        recognitions.push({
          studentId: 'unknown',
          confidence: 0,
          box: {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height
          },
          isRecognized: false
        });
        console.log('⚠️ Face detected but not recognized');
      }
    }

    // #region agent log
    const totalRecognitionTime = Date.now() - recognitionStartTime;
    fetch('http://127.0.0.1:7242/ingest/3082e2ba-98d4-447b-a2b8-4c8eb0b91e8e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'faceRecognition.ts:335', message: 'Face recognition completed', data: { totalTimeMs: totalRecognitionTime, recognitionsCount: recognitions.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion

    return recognitions;
  } catch (error) {
    console.error('❌ Error recognizing faces:', error);
    return [];
  }
};

// Get face descriptors for a student
export const getStudentFaceDescriptors = (studentId: string): Float32Array[] => {
  return faceDescriptors.get(studentId) || [];
};

// Clear face data for a student
export const clearStudentFaceData = (studentId: string): void => {
  faceDescriptors.delete(studentId);
};

// Get all registered students
export const getRegisteredStudents = (): string[] => {
  return Array.from(faceDescriptors.keys());
};

// Check if models are loaded
export const isFaceModelLoaded = (): boolean => {
  return isModelLoaded;
};

// Get debug information about registered students
export const getDebugInfo = () => {
  return {
    isModelLoaded,
    registeredStudents: Array.from(faceDescriptors.keys()),
    totalDescriptors: Array.from(faceDescriptors.values()).reduce((sum, descs) => sum + descs.length, 0)
  };
};
