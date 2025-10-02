'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GraduationCap, Loader2 } from 'lucide-react';
import { SimulationMode } from '@prisma/client';

interface ModeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  personaId: string;
  caseTitle: string;
  personaName: string;
}

export function ModeSelectionModal({
  isOpen,
  onClose,
  caseId,
  personaId,
  caseTitle,
  personaName,
}: ModeSelectionModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleModeSelection = async (mode: SimulationMode) => {
    setLoading(true);
    try {
      console.log('🚀 Starting simulation with mode:', mode);
      console.log('📋 Case ID:', caseId);
      console.log('👤 Persona ID:', personaId);
      
      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ caseId, personaId, mode }),
      });

      console.log('📡 API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Simulation created:', data);
        const { simulationId } = data;
        router.push(`/student/simulations/${simulationId}`);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to start simulation:', errorData);
        alert(`Failed to start simulation: ${errorData.error}`);
      }
    } catch (error) {
      console.error('❌ Error starting simulation:', error);
      alert(`Error starting simulation: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Choose Your Mode
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center text-sm text-gray-600 dark:text-gray-300">
            <p className="font-medium">{caseTitle}</p>
            <p>Chatting with {personaName}</p>
          </div>

          <div className="grid gap-4">
            {/* Learning Mode */}
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-blue-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-blue-700 dark:text-blue-300">
                      Learning Mode
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Practice and get feedback
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  In Learning Mode, you'll get real-time feedback and guidance to help you improve your social work skills.
                </p>
                <Button
                  onClick={() => handleModeSelection(SimulationMode.learning)}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <BookOpen className="h-4 w-4 mr-2" />
                  )}
                  Start Learning
                </Button>
              </CardContent>
            </Card>

            {/* Assessment Mode */}
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 hover:border-green-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-green-700 dark:text-green-300">
                      Assessment Mode
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Test your skills
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  In Assessment Mode, your performance will be evaluated and graded based on professional standards.
                </p>
                <Button
                  onClick={() => handleModeSelection(SimulationMode.assessment)}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <GraduationCap className="h-4 w-4 mr-2" />
                  )}
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
