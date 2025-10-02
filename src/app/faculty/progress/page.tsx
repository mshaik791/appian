'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Loader2,
  GraduationCap,
  Target
} from 'lucide-react';

interface StudentProgress {
  student: {
    id: string;
    email: string;
  };
  assignments: Array<{
    id: string;
    case: {
      id: string;
      title: string;
      competency: {
        name: string;
      };
    };
    createdAt: string;
    simulations: Array<{
      id: string;
      mode: 'learning' | 'assessment';
      status: 'active' | 'ended';
      startedAt: string;
      endedAt?: string;
      turns: Array<{
        id: string;
        speaker: 'student' | 'persona';
        createdAt: string;
      }>;
    }>;
  }>;
}

export default function FacultyProgressPage() {
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const response = await fetch('/api/faculty/progress', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch progress data');
        }
        
        const data = await response.json();
        setStudentProgress(data);
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  const getCompletionStatus = (assignment: any) => {
    if (assignment.simulations.length === 0) {
      return { status: 'not-started', label: 'Not Started', color: 'gray', icon: Clock };
    }

    const hasEndedSimulation = assignment.simulations.some((sim: any) => sim.status === 'ended');
    const hasActiveSimulation = assignment.simulations.some((sim: any) => sim.status === 'active');
    
    if (hasEndedSimulation) {
      return { status: 'completed', label: 'Completed', color: 'green', icon: CheckCircle };
    } else if (hasActiveSimulation) {
      return { status: 'in-progress', label: 'In Progress', color: 'blue', icon: TrendingUp };
    } else {
      return { status: 'not-started', label: 'Not Started', color: 'gray', icon: Clock };
    }
  };

  const getCompetencyTheme = (competencyName: string) => {
    switch (competencyName) {
      case 'Engagement':
        return { gradient: 'from-blue-500 to-purple-600', icon: '🤝' };
      case 'Ethics':
        return { gradient: 'from-green-500 to-teal-600', icon: '⚖️' };
      case 'Diversity':
        return { gradient: 'from-orange-500 to-pink-600', icon: '🌍' };
      default:
        return { gradient: 'from-gray-500 to-gray-600', icon: '📚' };
    }
  };

  const calculateOverallStats = () => {
    const totalStudents = studentProgress.length;
    const totalAssignments = studentProgress.reduce((sum, student) => sum + student.assignments.length, 0);
    const completedAssignments = studentProgress.reduce((sum, student) => 
      sum + student.assignments.filter(assignment => 
        assignment.simulations.some(sim => sim.status === 'ended')
      ).length, 0
    );
    const inProgressAssignments = studentProgress.reduce((sum, student) => 
      sum + student.assignments.filter(assignment => 
        assignment.simulations.some(sim => sim.status === 'active') &&
        !assignment.simulations.some(sim => sim.status === 'ended')
      ).length, 0
    );

    return {
      totalStudents,
      totalAssignments,
      completedAssignments,
      inProgressAssignments,
      completionRate: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading progress data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" />
          <p className="text-xl mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = calculateOverallStats();

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Student Progress Tracking
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Monitor student progress on assigned cases and simulations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Cases assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Finished simulations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Overall progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Student Progress Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Student Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentProgress.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Users className="h-16 w-16 mx-auto mb-6 opacity-50" />
              <h3 className="text-xl font-medium mb-3">No Student Data</h3>
              <p className="max-w-md mx-auto">
                No students have been assigned cases yet. Contact the administrator to assign cases to students.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {studentProgress.map((studentData) => (
                <div key={studentData.student.id} className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
                  {/* Student Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {studentData.student.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {studentData.student.email}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {studentData.assignments.length} assigned case{studentData.assignments.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Assignments Grid */}
                  {studentData.assignments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No cases assigned to this student</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {studentData.assignments.map((assignment) => {
                        const completionStatus = getCompletionStatus(assignment);
                        const theme = getCompetencyTheme(assignment.case.competency.name);
                        const StatusIcon = completionStatus.icon;

                        return (
                          <Card 
                            key={assignment.id} 
                            className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg
                              bg-gradient-to-br ${theme.gradient} text-white border-0`}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="text-2xl">{theme.icon}</div>
                                  <div>
                                    <CardTitle className="text-lg text-white">
                                      {assignment.case.title}
                                    </CardTitle>
                                    <Badge 
                                      variant="secondary" 
                                      className="bg-white/20 text-white border-white/30 text-xs mt-1"
                                    >
                                      {assignment.case.competency.name}
                                    </Badge>
                                  </div>
                                </div>
                                <StatusIcon className={`h-5 w-5 ${
                                  completionStatus.color === 'green' ? 'text-green-300' :
                                  completionStatus.color === 'blue' ? 'text-blue-300' :
                                  'text-gray-300'
                                }`} />
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {/* Status Badge */}
                              <div className="mb-4">
                                <Badge 
                                  className={`${
                                    completionStatus.color === 'green' ? 'bg-green-500/20 text-green-100 border-green-400/30' :
                                    completionStatus.color === 'blue' ? 'bg-blue-500/20 text-blue-100 border-blue-400/30' :
                                    'bg-gray-500/20 text-gray-100 border-gray-400/30'
                                  } text-xs`}
                                >
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {completionStatus.label}
                                </Badge>
                              </div>

                              {/* Assignment Info */}
                              <div className="mb-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                                <div className="flex items-center gap-2 text-xs text-white/80 mb-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Assigned {new Date(assignment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/80">
                                  <BookOpen className="h-3 w-3" />
                                  <span>{assignment.simulations.length} simulation{assignment.simulations.length !== 1 ? 's' : ''}</span>
                                </div>
                              </div>

                              {/* Simulation Details */}
                              {assignment.simulations.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-semibold text-white">Simulations:</h4>
                                  {assignment.simulations.map((simulation) => (
                                    <div key={simulation.id} className="p-2 bg-white/15 rounded text-xs">
                                      <div className="flex items-center justify-between">
                                        <span className="text-white/90">
                                          {simulation.mode === 'learning' ? '📚 Learning' : '🎓 Assessment'}
                                        </span>
                                        <span className={`${
                                          simulation.status === 'ended' ? 'text-green-300' :
                                          simulation.status === 'active' ? 'text-blue-300' :
                                          'text-gray-300'
                                        }`}>
                                          {simulation.status === 'ended' ? 'Completed' : 'Active'}
                                        </span>
                                      </div>
                                      <div className="text-white/70 mt-1">
                                        {simulation.turns.length} messages • 
                                        {simulation.status === 'ended' && simulation.endedAt 
                                          ? ` Completed ${new Date(simulation.endedAt).toLocaleDateString()}`
                                          : ` Started ${new Date(simulation.startedAt).toLocaleDateString()}`
                                        }
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Decorative elements */}
                              <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/5 rounded-full -translate-y-8 translate-x-8"></div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
