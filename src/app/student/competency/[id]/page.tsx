'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MessageCircle, Loader2, BookOpen, Search, Users, Clock, Star, CheckCircle } from 'lucide-react';
import { ModeSelectionModal } from '@/components/ModeSelectionModal';

interface Persona {
  id: string;
  name: string;
  avatarId: string;
  voiceId: string;
  backgroundJson: Record<string, unknown>;
}

interface Case {
  id: string;
  title: string;
  description: string;
  personas: Persona[];
  rubric: {
    name: string;
  };
  competency: {
    name: string;
  };
  learningObjectivesJson: string[];
}

interface Competency {
  id: string;
  name: string;
  desc: string;
}

// Define competency themes
const competencyThemes = {
  'Engagement': {
    gradient: 'from-blue-500 to-purple-600',
    icon: '🤝',
    accent: 'blue',
  },
  'Ethics': {
    gradient: 'from-green-500 to-teal-600',
    icon: '⚖️',
    accent: 'green',
  },
  'Diversity': {
    gradient: 'from-orange-500 to-pink-600',
    icon: '🌍',
    accent: 'orange',
  },
};

export default function CompetencyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [competency, setCompetency] = useState<Competency | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Mode selection modal state
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
            // Fetch competency details
            const competencyResponse = await fetch(`/api/competencies`, {
              credentials: 'include',
            });
        if (!competencyResponse.ok) {
          throw new Error('Failed to fetch competencies');
        }
        const competencies = await competencyResponse.json();
        const currentCompetency = competencies.find((c: Competency) => c.id === resolvedParams.id);
        
        if (!currentCompetency) {
          setError('Competency not found');
          return;
        }
        setCompetency(currentCompetency);

            // Fetch cases for this competency
            const casesResponse = await fetch(`/api/competencies/${resolvedParams.id}/cases`, {
              credentials: 'include',
            });
        if (!casesResponse.ok) {
          throw new Error('Failed to fetch cases');
        }
        const casesData = await casesResponse.json();
        setCases(casesData);
        setFilteredCases(casesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load competency data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id]);

  // Filter cases based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCases(cases);
    } else {
      const filtered = cases.filter(caseItem =>
        caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCases(filtered);
    }
  }, [searchQuery, cases]);

  const handleStartSimulation = (caseItem: Case, persona: Persona) => {
    setSelectedCase(caseItem);
    setSelectedPersona(persona);
    setIsModeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModeModalOpen(false);
    setSelectedCase(null);
    setSelectedPersona(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Skeleton cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="bg-gray-200 dark:bg-gray-700 h-24"></CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <Link href="/student">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Competencies
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!competency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Competency not found</h1>
          <Link href="/student">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Competencies
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const theme = competencyThemes[competency.name as keyof typeof competencyThemes] || {
    gradient: 'from-gray-500 to-gray-600',
    icon: '📚',
    accent: 'gray',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/student">
            <Button variant="outline" className="hover:bg-white/50 backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Competencies
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className={`text-4xl filter drop-shadow-lg`}>
              {theme.icon}
            </div>
            <div>
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`}>
                {competency.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {competency.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search scenarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/50 backdrop-blur-sm border-white/20 focus:bg-white/80"
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Found {filteredCases.length} scenario{filteredCases.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          )}
        </div>

        {/* Scenarios */}
        {filteredCases.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              {searchQuery ? 'No scenarios found' : 'No scenarios available'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {searchQuery 
                ? 'Try adjusting your search terms.'
                : 'No practice scenarios are available for this competency yet.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCases.map((caseItem) => (
              <Card 
                key={caseItem.id} 
                className="group hover:shadow-2xl transition-all duration-500 ease-out hover:scale-105 border-0 overflow-hidden bg-white/80 backdrop-blur-sm"
              >
                <CardHeader className={`bg-gradient-to-br ${theme.gradient} text-white relative overflow-hidden`}>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <CardTitle className="text-xl line-clamp-2 text-white drop-shadow-md">
                        {caseItem.title}
                      </CardTitle>
                      <Badge 
                        variant="secondary" 
                        className="bg-white/20 text-white border-white/30 backdrop-blur-sm ml-2 shrink-0"
                      >
                        {caseItem.rubric.name}
                      </Badge>
                    </div>
                    <p className="text-white/90 text-sm line-clamp-3 drop-shadow-sm">
                      {caseItem.description}
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-6">
                  {/* Learning Objectives */}
                  {caseItem.learningObjectivesJson && caseItem.learningObjectivesJson.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <BookOpen className="h-4 w-4" />
                        Learning Objectives:
                      </h4>
                      <div className="space-y-2">
                        {caseItem.learningObjectivesJson.map((objective, index) => (
                          <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                              {objective}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Personas */}
                  <div>
                    <h4 className="font-semibold mb-3 text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Users className="h-4 w-4" />
                      Available Personas ({caseItem.personas.length}):
                    </h4>
                    {caseItem.personas.length === 0 ? (
                      <p className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        No personas available for this scenario.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {caseItem.personas.map((persona) => (
                          <div 
                            key={persona.id} 
                            className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/20 transition-all duration-300 group/persona"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                                <AvatarFallback className={`bg-gradient-to-br ${theme.gradient} text-white font-bold text-sm`}>
                                  {persona.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                  {persona.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {persona.backgroundJson && typeof persona.backgroundJson === 'object' && 'age' in persona.backgroundJson 
                                    ? `Age: ${persona.backgroundJson.age}` 
                                    : 'Character'
                                  }
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleStartSimulation(caseItem, persona)}
                              className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all duration-300 group-hover/persona:scale-105`}
                            >
                              <MessageCircle className="mr-2 h-3 w-3" />
                              Start
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
          personaAvatarId={selectedPersona.avatarId}
          personaVoiceId={selectedPersona.voiceId}
        />
      )}
    </div>
  );
}
