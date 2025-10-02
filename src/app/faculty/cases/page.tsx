'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Search,
  GraduationCap,
  TrendingUp,
  Eye
} from 'lucide-react';

interface StudentSimulation {
  id: string;
  student: {
    email: string;
  };
  case: {
    title: string;
    competency: {
      name: string;
    };
  };
  persona: {
    name: string;
  };
  mode: 'learning' | 'assessment';
  status: 'active' | 'ended';
  startedAt: string;
  endedAt?: string;
  _count: {
    turns: number;
  };
}

interface StudentProgress {
  studentEmail: string;
  totalSimulations: number;
  completedSimulations: number;
  activeSimulations: number;
  competencies: string[];
  lastActivity: string;
}

export default function FacultyDashboard() {
  const [simulations, setSimulations] = useState<StudentSimulation[]>([]);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'learning' | 'assessment'>('all');

  useEffect(() => {
    fetchStudentProgress();
  }, []);

  const fetchStudentProgress = async () => {
    try {
      const response = await fetch('/api/faculty/student-progress', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setSimulations(data.simulations);
        setStudentProgress(data.studentProgress);
      }
    } catch (error) {
      console.error('Error fetching student progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSimulations = simulations.filter(sim => {
    const matchesSearch = sim.student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sim.case.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sim.persona.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = filterMode === 'all' || sim.mode === filterMode;
    return matchesSearch && matchesMode;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'ended':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'learning':
        return <Badge className="bg-blue-100 text-blue-800">Learning</Badge>;
      case 'assessment':
        return <Badge className="bg-purple-100 text-purple-800">Assessment</Badge>;
      default:
        return <Badge variant="secondary">{mode}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading student progress...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Student Progress Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Monitor student simulations and track learning outcomes
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentProgress.length}</div>
            <p className="text-xs text-muted-foreground">
              Active learners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Simulations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {simulations.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {simulations.filter(s => s.status === 'ended').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Finished simulations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentProgress.length > 0 
                ? Math.round((studentProgress.reduce((sum, s) => sum + s.completedSimulations, 0) / 
                            studentProgress.reduce((sum, s) => sum + s.totalSimulations, 0)) * 100) || 0
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Simulations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by student, case, or persona..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterMode === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterMode('all')}
              >
                All
              </Button>
              <Button
                variant={filterMode === 'learning' ? 'default' : 'outline'}
                onClick={() => setFilterMode('learning')}
              >
                Learning
              </Button>
              <Button
                variant={filterMode === 'assessment' ? 'default' : 'outline'}
                onClick={() => setFilterMode('assessment')}
              >
                Assessment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Progress Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Student Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {studentProgress.map((student) => (
              <div key={student.studentEmail} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{student.studentEmail}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>{student.totalSimulations} total simulations</span>
                    <span>{student.completedSimulations} completed</span>
                    <span>{student.activeSimulations} active</span>
                    <span>Last activity: {new Date(student.lastActivity).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {student.competencies.map((comp) => (
                      <Badge key={comp} variant="outline" className="text-xs">
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="w-32">
                  <div className="text-right text-sm text-gray-600">
                    {Math.round((student.completedSimulations / student.totalSimulations) * 100) || 0}% complete
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.round((student.completedSimulations / student.totalSimulations) * 100) || 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Simulations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Simulations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSimulations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No simulations found matching your criteria.
              </p>
            ) : (
              filteredSimulations.map((sim) => (
                <div key={sim.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-medium">{sim.student.email}</h3>
                      {getStatusBadge(sim.status)}
                      {getModeBadge(sim.mode)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span><BookOpen className="inline h-4 w-4 mr-1" />{sim.case.title}</span>
                        <span>with {sim.persona.name}</span>
                        <span>{sim._count.turns} messages</span>
                        <span>Started {new Date(sim.startedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          {sim.case.competency.name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}