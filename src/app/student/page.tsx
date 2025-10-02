'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users, 
  ArrowRight, 
  Sparkles, 
  CheckCircle, 
  Calendar,
  User,
  MessageCircle,
  Clock
} from 'lucide-react';
import { ModeSelectionModal } from '@/components/ModeSelectionModal';

interface Competency {
  id: string;
  name: string;
  desc: string;
  _count: {
    cases: number;
  };
}

interface AssignedCase {
  id: string;
  case: {
    id: string;
    title: string;
    description: string;
    competency: {
      name: string;
    };
    personas: Array<{
      id: string;
      name: string;
      avatarId: string;
      voiceId: string;
    }>;
  };
  admin: {
    email: string;
  };
  createdAt: string;
}

// Define gradient themes for each competency
const competencyThemes = {
  'Engagement': {
    gradient: 'from-blue-500 to-purple-600',
    icon: '🤝',
    hoverGradient: 'from-blue-600 to-purple-700',
  },
  'Ethics': {
    gradient: 'from-green-500 to-teal-600',
    icon: '⚖️',
    hoverGradient: 'from-green-600 to-teal-700',
  },
  'Diversity': {
    gradient: 'from-orange-500 to-pink-600',
    icon: '🌍',
    hoverGradient: 'from-orange-600 to-pink-700',
  },
};

export default function StudentDashboard() {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [assignedCases, setAssignedCases] = useState<AssignedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignedLoading, setAssignedLoading] = useState(true);
  const router = useRouter();

  // Mode selection modal state
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [selectedPersona, setSelectedPersona] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch competencies
        const competenciesResponse = await fetch('/api/competencies', {
          credentials: 'include',
        });
        if (competenciesResponse.ok) {
          const competenciesData = await competenciesResponse.json();
          setCompetencies(competenciesData);
        } else {
          console.error('Failed to fetch competencies');
        }

        // Fetch assigned cases
        const assignmentsResponse = await fetch('/api/assignments', {
          credentials: 'include',
        });
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          setAssignedCases(assignmentsData);
        } else {
          console.error('Failed to fetch assigned cases');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        setAssignedLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCompetencyClick = (competencyId: string) => {
    router.push(`/student/competency/${competencyId}`);
  };

  const handleStartSimulation = (caseItem: any, persona: any) => {
    setSelectedCase(caseItem);
    setSelectedPersona(persona);
    setIsModeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModeModalOpen(false);
    setSelectedCase(null);
    setSelectedPersona(null);
  };

  const handleAssignmentComplete = () => {
    setIsModeModalOpen(false);
    setSelectedCase(null);
    setSelectedPersona(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose a Competency
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Select a competency area to practice your social work skills
          </p>
        </div>
        
        {/* Skeleton Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="bg-gray-200 dark:bg-gray-700 h-32 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-blue-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Student Dashboard
            </h1>
            <Sparkles className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Practice your social work skills with assigned scenarios or explore competency areas
          </p>
        </div>

        {/* Assigned Cases Section */}
        {assignedCases.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Assigned Cases
              </h2>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {assignedCases.length} assigned
              </Badge>
            </div>
            
            {assignedLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="bg-gray-200 dark:bg-gray-700 h-32 rounded-t-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignedCases.map((assignment) => {
                  const caseItem = assignment.case;
                  const competencyName = caseItem.competency.name;
                  const theme = competencyThemes[competencyName as keyof typeof competencyThemes] || {
                    gradient: 'from-gray-500 to-gray-600',
                    icon: '📚',
                    hoverGradient: 'from-gray-600 to-gray-700',
                  };

                  return (
                    <Card 
                      key={assignment.id} 
                      className={`
                        group cursor-pointer transition-all duration-500 ease-out
                        hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20
                        bg-gradient-to-br ${theme.gradient} text-white
                        border-0 overflow-hidden relative
                        before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300
                        hover:before:opacity-100
                      `}
                    >
                      <CardHeader className="relative z-10 pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-5xl filter drop-shadow-lg">
                              {theme.icon}
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold mb-2 drop-shadow-md">
                                {caseItem.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge 
                                  variant="secondary" 
                                  className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs"
                                >
                                  {competencyName}
                                </Badge>
                                <Badge 
                                  variant="secondary" 
                                  className="bg-green-500/20 text-green-100 border-green-400/30 backdrop-blur-sm text-xs"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Assigned
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="relative z-10 pt-0">
                        <p className="text-white/90 text-sm leading-relaxed line-clamp-2 drop-shadow-sm mb-4">
                          {caseItem.description}
                        </p>
                        
                        {/* Assignment Info */}
                        <div className="mb-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                          <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
                            <User className="h-3 w-3" />
                            <span>Assigned by {assignment.admin.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/80">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(assignment.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Personas */}
                        {caseItem.personas.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Available Personas ({caseItem.personas.length}):
                            </h4>
                            <div className="space-y-2">
                              {caseItem.personas.map((persona) => (
                                <div 
                                  key={persona.id} 
                                  className="flex items-center justify-between p-2 bg-white/15 rounded-lg backdrop-blur-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8 ring-2 ring-white/50">
                                      <AvatarFallback className="bg-gradient-to-br from-blue-300 to-purple-400 text-white font-bold text-xs">
                                        {persona.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium">{persona.name}</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handleStartSimulation(caseItem, persona)}
                                    className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 h-auto"
                                  >
                                    <MessageCircle className="mr-1 h-3 w-3" />
                                    Start
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Decorative elements */}
                        <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -translate-y-8 translate-x-8"></div>
                      </CardContent>
                      
                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Competency Selection Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Browse All Competencies
            </h2>
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              Explore freely
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {competencies.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-6" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
                No competencies available
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Contact your instructor to set up competency areas for practice scenarios.
              </p>
            </div>
          ) : (
            competencies.map((competency) => {
              const theme = competencyThemes[competency.name as keyof typeof competencyThemes] || {
                gradient: 'from-gray-500 to-gray-600',
                icon: '📚',
                hoverGradient: 'from-gray-600 to-gray-700',
              };

              return (
                <Card 
                  key={competency.id} 
                  className={`
                    group cursor-pointer transition-all duration-500 ease-out
                    hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20
                    bg-gradient-to-br ${theme.gradient} text-white
                    border-0 overflow-hidden relative
                    before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300
                    hover:before:opacity-100
                  `}
                  onClick={() => handleCompetencyClick(competency.id)}
                >
                  <CardHeader className="relative z-10 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl filter drop-shadow-lg">
                          {theme.icon}
                        </div>
                        <div>
                          <CardTitle className="text-2xl font-bold mb-2 drop-shadow-md">
                            {competency.name}
                          </CardTitle>
                          <Badge 
                            variant="secondary" 
                            className="bg-white/20 text-white border-white/30 backdrop-blur-sm"
                          >
                            <Users className="h-3 w-3 mr-1" />
                            {competency._count.cases} scenario{competency._count.cases !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="h-6 w-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-0">
                    <p className="text-white/90 text-sm leading-relaxed line-clamp-3 drop-shadow-sm">
                      {competency.desc}
                    </p>
                    
                    {/* Decorative elements */}
                    <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -translate-y-8 translate-x-8"></div>
                  </CardContent>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Card>
              );
            })
          )}
        </div>

        {/* Bottom decorative element */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400 dark:text-gray-500">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        {/* Mode Selection Modal */}
        {selectedCase && selectedPersona && (
          <ModeSelectionModal
            isOpen={isModeModalOpen}
            onClose={handleCloseModal}
            caseId={selectedCase.id}
            personaId={selectedPersona.id}
            caseTitle={selectedCase.title}
            personaName={selectedPersona.name}
          />
        )}
      </div>
    </div>
  );
}