'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Loader2, 
  BookOpen, 
  Users, 
  CheckCircle,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

interface Student {
  id: string;
  email: string;
  assignedCases: Array<{
    id: string;
    case: {
      id: string;
      title: string;
    };
  }>;
}

interface Competency {
  id: string;
  name: string;
  desc: string;
  _count: {
    cases: number;
  };
}

interface Case {
  id: string;
  title: string;
  description: string;
  competency: {
    name: string;
  };
  personas: Array<{
    id: string;
    name: string;
  }>;
}

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  student: Student;
  competencies: Competency[];
}

export function AssignmentModal({
  isOpen,
  onClose,
  onComplete,
  student,
  competencies,
}: AssignmentModalProps) {
  const [selectedCompetency, setSelectedCompetency] = useState<Competency | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'competency' | 'case'>('competency');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedCompetency(null);
      setSelectedCase(null);
      setCases([]);
      setError(null);
      setStep('competency');
    }
  }, [isOpen]);

  const handleCompetencySelect = async (competency: Competency) => {
    setSelectedCompetency(competency);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/competencies/${competency.id}/cases`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }

      const casesData = await response.json();
      
      // Filter out cases already assigned to this student
      const assignedCaseIds = student.assignedCases.map(ac => ac.case.id);
      const availableCases = casesData.filter((caseItem: Case) => 
        !assignedCaseIds.includes(caseItem.id)
      );
      
      setCases(availableCases);
      setStep('case');
    } catch (err) {
      console.error('Error fetching cases:', err);
      setError('Failed to load cases for this competency');
    } finally {
      setLoading(false);
    }
  };

  const handleCaseSelect = (caseItem: Case) => {
    setSelectedCase(caseItem);
  };

  const handleAssign = async () => {
    if (!selectedCase) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          caseId: selectedCase.id,
          studentId: student.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assignment');
      }

      onComplete();
    } catch (err: any) {
      console.error('Error creating assignment:', err);
      setError(err.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'case') {
      setStep('competency');
      setSelectedCase(null);
      setCases([]);
    }
  };

  const getCompetencyTheme = (competencyName: string) => {
    switch (competencyName) {
      case 'Engagement':
        return {
          gradient: 'from-blue-500 to-purple-600',
          icon: '🤝',
          accent: 'blue',
        };
      case 'Ethics':
        return {
          gradient: 'from-green-500 to-teal-600',
          icon: '⚖️',
          accent: 'green',
        };
      case 'Diversity':
        return {
          gradient: 'from-orange-500 to-pink-600',
          icon: '🌍',
          accent: 'orange',
        };
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          icon: '📚',
          accent: 'gray',
        };
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Assign Case to Student
          </DialogTitle>
          <DialogDescription className="text-base">
            Assign a practice scenario to <span className="font-semibold text-blue-600">{student.email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-lg">
                    {student.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{student.email}</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Currently assigned to {student.assignedCases.length} case{student.assignedCases.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Select Competency */}
          {step === 'competency' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold">Select Competency Area</h3>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Loading competencies...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {competencies.map((competency) => {
                    const theme = getCompetencyTheme(competency.name);
                    return (
                      <Card
                        key={competency.id}
                        className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg
                          bg-gradient-to-br ${theme.gradient} text-white border-0`}
                        onClick={() => handleCompetencySelect(competency)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="text-3xl">{theme.icon}</div>
                            <ArrowRight className="h-5 w-5 text-white/70" />
                          </div>
                          <CardTitle className="text-xl text-white">
                            {competency.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-blue-100 text-sm mb-3">
                            {competency.desc}
                          </p>
                          <Badge className="bg-white/30 text-white hover:bg-white/40">
                            <BookOpen className="h-3 w-3 mr-1" />
                            {competency._count.cases} scenario{competency._count.cases !== 1 ? 's' : ''}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Case */}
          {step === 'case' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  className="mr-2"
                >
                  ← Back
                </Button>
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold">Select Case</h3>
              </div>

              {selectedCompetency && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <GraduationCap className="h-4 w-4 inline mr-1" />
                    Selected: <span className="font-semibold">{selectedCompetency.name}</span>
                  </p>
                </div>
              )}

              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Loading cases...</p>
                </div>
              ) : cases.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No available cases</p>
                  <p className="text-sm">All cases in this competency are already assigned to this student</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cases.map((caseItem) => (
                    <Card
                      key={caseItem.id}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                        selectedCase?.id === caseItem.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => handleCaseSelect(caseItem)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-2">{caseItem.title}</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                              {caseItem.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {caseItem.competency.name}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                {caseItem.personas.length} persona{caseItem.personas.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                          {selectedCase?.id === caseItem.id && (
                            <CheckCircle className="h-6 w-6 text-blue-500 ml-4" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Assign Button */}
              {selectedCase && (
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={handleAssign}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Assign Case
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
