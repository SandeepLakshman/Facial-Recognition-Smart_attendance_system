import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Zap, CheckCircle } from "lucide-react";

interface FaceRecognitionSelectorProps {
  onSelectMethod: (method: 'faceapi' | 'opencv') => void;
}

const FaceRecognitionSelector = ({ onSelectMethod }: FaceRecognitionSelectorProps) => {
  const [selectedMethod, setSelectedMethod] = useState<'faceapi' | 'opencv' | null>(null);

  const methods = [
    {
      id: 'faceapi' as const,
      name: 'Face-API.js',
      description: 'Deep learning-based face recognition using TensorFlow.js',
      icon: Brain,
      features: [
        'High accuracy with deep learning',
        'Real-time face detection',
        'Facial landmark detection',
        'Expression recognition',
        'Works in browser'
      ],
      pros: ['Very accurate', 'Modern approach', 'Good for complex scenarios'],
      cons: ['Larger model size', 'Requires more processing power']
    },
    {
      id: 'opencv' as const,
      name: 'OpenCV + KNN',
      description: 'Traditional computer vision with machine learning',
      icon: Zap,
      features: [
        'Haar Cascade face detection',
        'KNN classification',
        'Lightweight and fast',
        'Traditional CV approach',
        'Good for simple scenarios'
      ],
      pros: ['Fast processing', 'Lightweight', 'Traditional approach'],
      cons: ['Lower accuracy', 'Requires more training data']
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Choose Face Recognition Method</h1>
        <p className="text-lg text-muted-foreground">
          Select the face recognition approach that best fits your needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <Card 
              key={method.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{method.name}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-6 w-6 text-primary ml-auto" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Features:</h4>
                  <ul className="text-sm space-y-1">
                    {method.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-green-600">Pros:</h4>
                    <ul className="text-sm space-y-1">
                      {method.pros.map((pro, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-orange-600">Cons:</h4>
                    <ul className="text-sm space-y-1">
                      {method.cons.map((con, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedMethod && (
        <div className="text-center">
          <Button 
            onClick={() => onSelectMethod(selectedMethod)}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Continue with {methods.find(m => m.id === selectedMethod)?.name}
          </Button>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground">
        <p>💡 <strong>Recommendation:</strong> For most use cases, Face-API.js provides better accuracy, 
        while OpenCV + KNN is faster and more lightweight.</p>
      </div>
    </div>
  );
};

export default FaceRecognitionSelector;
