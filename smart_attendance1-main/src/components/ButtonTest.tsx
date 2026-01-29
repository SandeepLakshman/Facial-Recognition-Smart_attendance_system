import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const ButtonTest = () => {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({
    faceDetection: 'pending',
    register: 'pending',
    navigation: 'pending',
    camera: 'pending'
  });

  const runTests = async () => {
    const results = { ...testResults };
    
    // Test 1: Face Detection Button
    try {
      const faceDetectionBtn = document.querySelector('[href="/detect"]');
      if (faceDetectionBtn) {
        results.faceDetection = 'success';
      } else {
        results.faceDetection = 'error';
      }
    } catch (error) {
      results.faceDetection = 'error';
    }

    // Test 2: Register Button
    try {
      const registerBtn = document.querySelector('button:contains("Register")');
      if (registerBtn) {
        results.register = 'success';
      } else {
        results.register = 'error';
      }
    } catch (error) {
      results.register = 'error';
    }

    // Test 3: Navigation
    try {
      const links = document.querySelectorAll('a[href]');
      if (links.length > 0) {
        results.navigation = 'success';
      } else {
        results.navigation = 'error';
      }
    } catch (error) {
      results.navigation = 'error';
    }

    // Test 4: Camera Access
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        results.camera = 'success';
      } else {
        results.camera = 'error';
      }
    } catch (error) {
      results.camera = 'error';
    }

    setTestResults(results);
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return 'Working';
      case 'error':
        return 'Error';
      default:
        return 'Pending';
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Button Functionality Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} className="w-full">
          Run Button Tests
        </Button>
        
        <div className="space-y-3">
          {Object.entries(testResults).map(([test, status]) => (
            <div key={test} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                {getStatusIcon(status)}
                <span className="capitalize">{test.replace(/([A-Z])/g, ' $1')}</span>
              </div>
              <span className={`text-sm font-medium ${
                status === 'success' ? 'text-green-600' : 
                status === 'error' ? 'text-red-600' : 
                'text-yellow-600'
              }`}>
                {getStatusText(status)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ButtonTest;
